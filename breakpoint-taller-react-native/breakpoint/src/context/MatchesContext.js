import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useConnectivity } from './ConnectivityContext';
import { initDatabase } from '../database/db';
import * as repo from '../database/matchesRepository';
import * as matchesApi from '../services/matchesApi';
import { syncPendingMatches } from '../services/syncService';
import { NetworkError, describeError } from '../utils/errors';
import { readFilters, writeFilters, readLastSync, writeLastSync } from '../utils/prefs';

const MatchesContext = createContext(null);

const initialState = {
  ready: false,
  items: [],
  filters: { search: '', superficie: 'todas', resultado: 'todos' },
  // Estados independientes por operación.
  loadingInitial: true,
  refreshing: false,
  listError: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
  deletingId: null,
  deleteError: null,
  syncing: false,
  syncResult: null,
  counters: { pending: 0, syncing: 0, failed: 0, total: 0 },
  lastSyncAt: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'ready':
      return { ...state, ready: true };
    case 'filters/set':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'list/start':
      return { ...state, loadingInitial: true, listError: null };
    case 'list/refresh':
      return { ...state, refreshing: true, listError: null };
    case 'list/success':
      return { ...state, items: action.items, loadingInitial: false, refreshing: false, listError: null };
    case 'list/local':
      return { ...state, items: action.items };
    case 'list/error':
      return { ...state, loadingInitial: false, refreshing: false, listError: action.error };
    case 'create/start':
      return { ...state, creating: true, createError: null };
    case 'create/success':
      return { ...state, creating: false };
    case 'create/error':
      return { ...state, creating: false, createError: action.error };
    case 'update/start':
      return { ...state, updating: true, updateError: null };
    case 'update/success':
      return { ...state, updating: false };
    case 'update/error':
      return { ...state, updating: false, updateError: action.error };
    case 'delete/start':
      return { ...state, deletingId: action.id, deleteError: null };
    case 'delete/success':
      return { ...state, deletingId: null };
    case 'delete/error':
      return { ...state, deletingId: null, deleteError: action.error };
    case 'sync/start':
      return { ...state, syncing: true, syncResult: null };
    case 'sync/success':
      return { ...state, syncing: false, syncResult: action.result, lastSyncAt: action.at ?? state.lastSyncAt };
    case 'sync/error':
      return { ...state, syncing: false, syncResult: { error: action.error } };
    case 'counters':
      return { ...state, counters: action.counters };
    case 'lastSync':
      return { ...state, lastSyncAt: action.at };
    case 'reset':
      return { ...initialState, ready: state.ready, loadingInitial: false };
    default:
      return state;
  }
}

export function MatchesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { owner, token, isAuthenticated } = useAuth();
  const { isOnline } = useConnectivity();

  const filtersRef = useRef(state.filters);
  filtersRef.current = state.filters;
  const wasOnline = useRef(isOnline);

  const refreshCounters = useCallback(async () => {
    if (!owner) return;
    const counters = await repo.countByStatus(owner);
    dispatch({ type: 'counters', counters });
  }, [owner]);

  const loadLocal = useCallback(async () => {
    if (!owner) return [];
    const items = await repo.listMatches(owner, filtersRef.current);
    dispatch({ type: 'list/local', items });
    await refreshCounters();
    return items;
  }, [owner, refreshCounters]);

  // Estrategia local primero: SQLite -> pantalla -> (si hay red) API -> SQLite -> pantalla.
  const bootstrap = useCallback(
    async ({ mode = 'initial' } = {}) => {
      if (!owner) return;
      dispatch({ type: mode === 'refresh' ? 'list/refresh' : 'list/start' });

      try {
        await initDatabase();
        const local = await repo.listMatches(owner, filtersRef.current);
        dispatch({ type: 'list/local', items: local });
        await refreshCounters();

        if (!isOnline) {
          dispatch({ type: 'list/success', items: local });
          return;
        }

        const remote = await matchesApi.fetchMatches({ token });
        for (const match of remote) {
          await repo.upsertFromRemote(owner, match);
        }

        const at = new Date().toISOString();
        await writeLastSync(at);
        dispatch({ type: 'lastSync', at });

        const merged = await repo.listMatches(owner, filtersRef.current);
        dispatch({ type: 'list/success', items: merged });
        await refreshCounters();
      } catch (error) {
        const local = owner ? await repo.listMatches(owner, filtersRef.current) : [];
        dispatch({ type: 'list/local', items: local });
        dispatch({ type: 'list/error', error: describeError(error) });
      }
    },
    [owner, token, isOnline, refreshCounters]
  );

  const syncNow = useCallback(async () => {
    if (!owner) return null;
    dispatch({ type: 'sync/start' });
    try {
      const result = await syncPendingMatches({ owner, token, onProgress: loadLocal });
      const at = new Date().toISOString();
      await writeLastSync(at);
      dispatch({ type: 'sync/success', result, at });
      await loadLocal();
      return result;
    } catch (error) {
      dispatch({ type: 'sync/error', error: describeError(error) });
      return null;
    }
  }, [owner, token, loadLocal]);

  const createMatch = useCallback(
    async (data) => {
      if (!owner) return { ok: false, error: 'Sesión no disponible.' };
      dispatch({ type: 'create/start' });
      try {
        if (isOnline) {
          const created = await matchesApi.createMatch(data, { token });
          await repo.insertMatch(owner, data, {
            syncStatus: 'synced',
            remoteId: created?.remoteId ?? null,
            remoteSimulated: true,
          });
        } else {
          // Escritura offline: queda pendiente de sincronización.
          await repo.insertMatch(owner, data, { syncStatus: 'pending', pendingAction: 'create' });
        }
        dispatch({ type: 'create/success' });
        await loadLocal();
        return { ok: true, offline: !isOnline };
      } catch (error) {
        if (error instanceof NetworkError) {
          await repo.insertMatch(owner, data, { syncStatus: 'pending', pendingAction: 'create' });
          dispatch({ type: 'create/success' });
          await loadLocal();
          return { ok: true, offline: true };
        }
        dispatch({ type: 'create/error', error: describeError(error) });
        return { ok: false, error: describeError(error) };
      }
    },
    [owner, token, isOnline, loadLocal]
  );

  const updateMatch = useCallback(
    async (id, data) => {
      if (!owner) return { ok: false, error: 'Sesión no disponible.' };
      dispatch({ type: 'update/start' });
      try {
        const current = await repo.getMatchById(id);
        if (!current) throw new Error('El partido ya no existe en tu dispositivo.');

        if (isOnline && current.remoteId) {
          try {
            await matchesApi.updateMatch(current.remoteId, data, { token });
            await repo.updateMatch(id, data, { syncStatus: 'synced', pendingAction: null });
          } catch (error) {
            if (error instanceof NetworkError) {
              await repo.updateMatch(id, data, { syncStatus: 'pending', pendingAction: 'update' });
            } else if (error.status === 404 && current.remoteSimulated) {
              // Escritura simulada por la API: se conserva la copia local.
              await repo.updateMatch(id, data, { syncStatus: 'synced', pendingAction: null });
            } else {
              throw error;
            }
          }
        } else {
          // Escritura offline (o registro aún sin id remoto): queda pendiente.
          await repo.updateMatch(id, data, {
            syncStatus: 'pending',
            pendingAction: current.pendingAction === 'create' ? 'create' : 'update',
          });
        }

        dispatch({ type: 'update/success' });
        await loadLocal();
        return { ok: true, offline: !isOnline };
      } catch (error) {
        dispatch({ type: 'update/error', error: describeError(error) });
        return { ok: false, error: describeError(error) };
      }
    },
    [owner, token, isOnline, loadLocal]
  );

  const deleteMatch = useCallback(
    async (id) => {
      if (!owner) return { ok: false };
      dispatch({ type: 'delete/start', id });
      try {
        const current = await repo.getMatchById(id);
        if (!current) throw new Error('El partido ya no existe en tu dispositivo.');

        if (!current.remoteId) {
          await repo.hardDeleteMatch(id);
        } else if (isOnline) {
          try {
            await matchesApi.deleteMatch(current.remoteId, { token });
            await repo.hardDeleteMatch(id);
          } catch (error) {
            if (error instanceof NetworkError) {
              await repo.markPendingDelete(id);
            } else if (error.status === 404) {
              await repo.hardDeleteMatch(id);
            } else {
              throw error;
            }
          }
        } else {
          await repo.markPendingDelete(id);
        }

        dispatch({ type: 'delete/success' });
        await loadLocal();
        return { ok: true, offline: !isOnline };
      } catch (error) {
        dispatch({ type: 'delete/error', error: describeError(error) });
        return { ok: false, error: describeError(error) };
      }
    },
    [owner, token, isOnline, loadLocal]
  );

  const setFilters = useCallback(
    async (filters) => {
      dispatch({ type: 'filters/set', filters });
      const next = { ...filtersRef.current, ...filters };
      filtersRef.current = next;
      await writeFilters(next);
      if (!owner) return;
      const items = await repo.listMatches(owner, next);
      dispatch({ type: 'list/local', items });
    },
    [owner]
  );

  // Carga inicial cuando hay sesión.
  useEffect(() => {
    if (!isAuthenticated || !owner) {
      dispatch({ type: 'reset' });
      return;
    }
    (async () => {
      await initDatabase();
      const savedFilters = await readFilters();
      if (savedFilters) {
        dispatch({ type: 'filters/set', filters: savedFilters });
        filtersRef.current = { ...filtersRef.current, ...savedFilters };
      }
      const at = await readLastSync();
      if (at) dispatch({ type: 'lastSync', at });
      dispatch({ type: 'ready' });
      await bootstrap({ mode: 'initial' });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, owner]);

  // Al recuperar la conexión se intenta sincronizar lo pendiente.
  useEffect(() => {
    const recovered = !wasOnline.current && isOnline;
    wasOnline.current = isOnline;
    if (!recovered || !isAuthenticated || !owner) return;
    (async () => {
      const counters = await repo.countByStatus(owner);
      if (counters.pending > 0 || counters.syncing > 0) {
        await syncNow();
      }
      await bootstrap({ mode: 'refresh' });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, isAuthenticated, owner]);

  const value = useMemo(
    () => ({
      ...state,
      loadLocal,
      bootstrap,
      refresh: () => bootstrap({ mode: 'refresh' }),
      createMatch,
      updateMatch,
      deleteMatch,
      syncNow,
      setFilters,
      refreshCounters,
      getMatchById: repo.getMatchById,
      getPendingMatches: () => repo.getPendingMatches(owner),
      getStatsSummary: () => repo.getStatsSummary(owner),
      getRivalProfiles: () => repo.getRivalProfiles(owner),
      listMatchesByRival: (rival) => repo.listMatchesByRival(owner, rival),
      clearLocalData: async () => {
        await repo.clearOwnerData(owner);
        await loadLocal();
      },
    }),
    [state, loadLocal, bootstrap, createMatch, updateMatch, deleteMatch, syncNow, setFilters, refreshCounters, owner]
  );

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
}

export function useMatches() {
  const context = useContext(MatchesContext);
  if (!context) throw new Error('useMatches debe usarse dentro de MatchesProvider');
  return context;
}

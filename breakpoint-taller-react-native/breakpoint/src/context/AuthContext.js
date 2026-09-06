import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import * as authService from '../services/authService';
import { HttpError, NetworkError, describeError } from '../utils/errors';

const AuthContext = createContext(null);

const initialState = {
  status: 'checking', // checking | guest | authenticated
  token: null,
  user: null,
  signingIn: false,
  error: null,
  restoredOffline: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'restore/success':
      return { ...state, status: 'authenticated', token: action.token, user: action.user, restoredOffline: Boolean(action.offline) };
    case 'restore/empty':
      return { ...state, status: 'guest', token: null, user: null };
    case 'signin/start':
      return { ...state, signingIn: true, error: null };
    case 'signin/success':
      return { ...state, signingIn: false, status: 'authenticated', token: action.token, user: action.user, error: null, restoredOffline: false };
    case 'signin/error':
      return { ...state, signingIn: false, error: action.error };
    case 'signout':
      return { ...initialState, status: 'guest' };
    case 'error/clear':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Al iniciar la app se intenta restaurar la sesión guardada en SecureStore.
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const session = await authService.loadSession();
        if (!alive) return;

        if (!session?.token) {
          dispatch({ type: 'restore/empty' });
          return;
        }

        try {
          const profile = await authService.fetchProfile(session.token);
          if (!alive) return;
          dispatch({ type: 'restore/success', token: session.token, user: { ...session.user, ...profile } });
        } catch (error) {
          if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
            await authService.clearSession();
            if (alive) dispatch({ type: 'restore/empty' });
            return;
          }
          // Sin internet la sesión sigue siendo válida: la app debe abrir offline.
          if (alive) dispatch({ type: 'restore/success', token: session.token, user: session.user, offline: true });
        }
      } catch {
        if (alive) dispatch({ type: 'restore/empty' });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (username, password) => {
    dispatch({ type: 'signin/start' });
    try {
      const session = await authService.login({ username, password });
      await authService.saveSession(session);
      dispatch({ type: 'signin/success', token: session.token, user: session.user });
      return true;
    } catch (error) {
      const message = error instanceof NetworkError
        ? 'Necesitas conexión para iniciar sesión por primera vez.'
        : describeError(error);
      dispatch({ type: 'signin/error', error: message });
      return false;
    }
  }, []);

  const signOut = useCallback(async () => {
    await authService.clearSession();
    dispatch({ type: 'signout' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'error/clear' }), []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated',
      owner: state.user?.username ?? null,
      signIn,
      signOut,
      clearError,
    }),
    [state, signIn, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

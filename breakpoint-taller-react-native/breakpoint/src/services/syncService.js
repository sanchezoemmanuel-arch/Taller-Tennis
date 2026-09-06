import * as matchesApi from './matchesApi';
import * as repo from '../database/matchesRepository';
import { HttpError, NetworkError } from '../utils/errors';

// DummyJSON simula las escrituras: el recurso creado no persiste en el servidor.
// Cuando eso ocurre, un PATCH/DELETE posterior responde 404 y lo tratamos como
// "sincronizado (escritura simulada)" en vez de un fallo real.
function isSimulatedMissing(error, row) {
  return error instanceof HttpError && error.status === 404 && row.remoteSimulated;
}

const SIMULATED_NOTE = 'La API simula las escrituras: el registro no persiste en el servidor.';

export async function syncPendingMatches({ owner, token, onProgress }) {
  const pending = await repo.getPendingMatches(owner);
  const result = { total: pending.length, synced: 0, failed: 0, interrupted: false };

  for (const row of pending) {
    await repo.markStatus(row.id, 'syncing');
    if (onProgress) await onProgress();

    try {
      if (row.pendingAction === 'create' || (row.pendingAction === 'update' && !row.remoteId)) {
        const created = await matchesApi.createMatch(row, { token });
        await repo.markStatus(row.id, 'synced', {
          pendingAction: null,
          remoteId: created.remoteId,
          remoteSimulated: true,
          lastError: SIMULATED_NOTE,
        });
      } else if (row.pendingAction === 'update') {
        await matchesApi.updateMatch(row.remoteId, row, { token });
        await repo.markStatus(row.id, 'synced', { pendingAction: null, lastError: null });
      } else if (row.pendingAction === 'delete') {
        await matchesApi.deleteMatch(row.remoteId, { token });
        await repo.hardDeleteMatch(row.id);
      } else {
        await repo.markStatus(row.id, 'synced', { pendingAction: null, lastError: null });
      }
      result.synced += 1;
    } catch (error) {
      if (error instanceof NetworkError) {
        // Se perdió la conexión a mitad de la cola: vuelve a pendiente y se detiene.
        await repo.markStatus(row.id, 'pending', { lastError: error.message });
        result.interrupted = true;
        break;
      }

      if (isSimulatedMissing(error, row)) {
        if (row.pendingAction === 'delete') {
          await repo.hardDeleteMatch(row.id);
        } else {
          await repo.markStatus(row.id, 'synced', { pendingAction: null, lastError: SIMULATED_NOTE });
        }
        result.synced += 1;
        continue;
      }

      await repo.markStatus(row.id, 'failed', { lastError: error.message });
      result.failed += 1;
    }

    if (onProgress) await onProgress();
  }

  return result;
}

// Reintento manual de un registro marcado como fallido.
export async function retryMatch({ matchId, token }) {
  const row = await repo.getMatchById(matchId);
  if (!row || !row.pendingAction) return null;
  await repo.markStatus(row.id, 'pending', { lastError: null });
  return syncPendingMatches({ owner: row.owner, token });
}

// Repositorio local: todo el SQL vive aquí, nunca dentro de las pantallas.
// Todas las consultas usan parámetros (?) y jamás concatenan datos del usuario.
import { getDatabase } from './db';

function nowISO() {
  return new Date().toISOString();
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    remoteId: row.remote_id,
    owner: row.owner,
    rival: row.rival,
    torneo: row.torneo,
    superficie: row.superficie,
    fecha: row.fecha,
    resultado: row.resultado,
    marcador: row.marcador,
    primerSaquePct: row.primer_saque_pct,
    puntosGanadosSaque: row.puntos_ganados_saque,
    winners: row.winners,
    erroresNoForzados: row.errores_no_forzados,
    patronRival: row.patron_rival,
    ladoDebil: row.lado_debil,
    notas: row.notas,
    syncStatus: row.sync_status,
    pendingAction: row.pending_action,
    remoteSimulated: Boolean(row.remote_simulated),
    lastError: row.last_error,
    updatedAt: row.updated_at,
    syncedAt: row.synced_at,
  };
}

function toValues(owner, data) {
  return [
    owner,
    String(data.rival ?? '').trim(),
    String(data.torneo ?? '').trim(),
    String(data.superficie ?? 'dura'),
    String(data.fecha ?? '').slice(0, 10),
    String(data.resultado ?? 'victoria'),
    String(data.marcador ?? '').trim(),
    Number(data.primerSaquePct) || 0,
    Number(data.puntosGanadosSaque) || 0,
    Number(data.winners) || 0,
    Number(data.erroresNoForzados) || 0,
    String(data.patronRival ?? ''),
    String(data.ladoDebil ?? ''),
    String(data.notas ?? ''),
  ];
}

const VISIBLE = "(pending_action IS NULL OR pending_action <> 'delete')";

export async function listMatches(owner, filters = {}) {
  const db = await getDatabase();
  const { search = '', superficie = 'todas', resultado = 'todos' } = filters;

  const clauses = ['owner = ?', VISIBLE];
  const params = [owner];

  const term = String(search).trim().toLowerCase();
  if (term) {
    clauses.push('(LOWER(rival) LIKE ? OR LOWER(torneo) LIKE ?)');
    params.push(`%${term}%`, `%${term}%`);
  }
  if (superficie !== 'todas') {
    clauses.push('superficie = ?');
    params.push(superficie);
  }
  if (resultado !== 'todos') {
    clauses.push('resultado = ?');
    params.push(resultado);
  }

  // Solo la estructura del WHERE se compone; los valores siempre van como parámetros.
  const sql = `SELECT * FROM matches WHERE ${clauses.join(' AND ')}
               ORDER BY date(fecha) DESC, id DESC LIMIT 300`;
  const rows = await db.getAllAsync(sql, params);
  return rows.map(mapRow);
}

export async function getMatchById(id) {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT * FROM matches WHERE id = ?', [id]);
  return mapRow(row);
}

export async function getByRemoteId(owner, remoteId) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    'SELECT * FROM matches WHERE owner = ? AND remote_id = ?',
    [owner, String(remoteId)]
  );
  return mapRow(row);
}

export async function insertMatch(owner, data, { syncStatus = 'synced', pendingAction = null, remoteId = null, remoteSimulated = false } = {}) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO matches
      (owner, rival, torneo, superficie, fecha, resultado, marcador,
       primer_saque_pct, puntos_ganados_saque, winners, errores_no_forzados,
       patron_rival, lado_debil, notas,
       remote_id, sync_status, pending_action, remote_simulated, updated_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ...toValues(owner, data),
      remoteId ? String(remoteId) : null,
      syncStatus,
      pendingAction,
      remoteSimulated ? 1 : 0,
      nowISO(),
      syncStatus === 'synced' ? nowISO() : null,
    ]
  );
  return getMatchById(result.lastInsertRowId);
}

export async function updateMatch(id, data, { syncStatus, pendingAction } = {}) {
  const db = await getDatabase();
  const current = await getMatchById(id);
  if (!current) return null;

  await db.runAsync(
    `UPDATE matches SET
       rival = ?, torneo = ?, superficie = ?, fecha = ?, resultado = ?, marcador = ?,
       primer_saque_pct = ?, puntos_ganados_saque = ?, winners = ?, errores_no_forzados = ?,
       patron_rival = ?, lado_debil = ?, notas = ?,
       sync_status = ?, pending_action = ?, updated_at = ?
     WHERE id = ?`,
    [
      ...toValues(current.owner, data).slice(1),
      syncStatus ?? current.syncStatus,
      pendingAction === undefined ? current.pendingAction : pendingAction,
      nowISO(),
      id,
    ]
  );
  return getMatchById(id);
}

export async function markStatus(id, syncStatus, { pendingAction, lastError = null, remoteId, remoteSimulated } = {}) {
  const db = await getDatabase();
  const current = await getMatchById(id);
  if (!current) return null;

  await db.runAsync(
    `UPDATE matches SET sync_status = ?, pending_action = ?, last_error = ?,
       remote_id = ?, remote_simulated = ?, synced_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      syncStatus,
      pendingAction === undefined ? current.pendingAction : pendingAction,
      lastError,
      remoteId === undefined ? current.remoteId : (remoteId ? String(remoteId) : null),
      remoteSimulated === undefined ? (current.remoteSimulated ? 1 : 0) : (remoteSimulated ? 1 : 0),
      syncStatus === 'synced' ? nowISO() : current.syncedAt,
      nowISO(),
      id,
    ]
  );
  return getMatchById(id);
}

export async function markPendingDelete(id) {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE matches SET sync_status = 'pending', pending_action = 'delete', updated_at = ? WHERE id = ?",
    [nowISO(), id]
  );
  return getMatchById(id);
}

export async function hardDeleteMatch(id) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM matches WHERE id = ?', [id]);
}

// Estrategia local primero: el servidor actualiza la copia local,
// salvo cuando la fila tiene cambios locales sin sincronizar (gana el cliente).
export async function upsertFromRemote(owner, match) {
  const existing = await getByRemoteId(owner, match.remoteId);

  if (!existing) {
    await insertMatch(owner, match, { syncStatus: 'synced', remoteId: match.remoteId });
    return 'inserted';
  }

  if (existing.pendingAction) {
    return 'skipped';
  }

  await updateMatch(existing.id, match, { syncStatus: 'synced', pendingAction: null });
  return 'updated';
}

export async function getPendingMatches(owner) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM matches
     WHERE owner = ? AND pending_action IS NOT NULL
     ORDER BY updated_at ASC`,
    [owner]
  );
  return rows.map(mapRow);
}

export async function countByStatus(owner) {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT
       SUM(CASE WHEN sync_status = 'pending' THEN 1 ELSE 0 END) AS pending,
       SUM(CASE WHEN sync_status = 'syncing' THEN 1 ELSE 0 END) AS syncing,
       SUM(CASE WHEN sync_status = 'failed' THEN 1 ELSE 0 END) AS failed,
       COUNT(*) AS total
     FROM matches WHERE owner = ?`,
    [owner]
  );
  return {
    pending: row?.pending ?? 0,
    syncing: row?.syncing ?? 0,
    failed: row?.failed ?? 0,
    total: row?.total ?? 0,
  };
}

export async function getStatsSummary(owner) {
  const db = await getDatabase();

  const totals = await db.getFirstAsync(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN resultado = 'victoria' THEN 1 ELSE 0 END) AS victorias,
            AVG(primer_saque_pct) AS promedio_primer_saque,
            AVG(puntos_ganados_saque) AS promedio_puntos_saque,
            SUM(winners) AS winners,
            SUM(errores_no_forzados) AS errores
     FROM matches WHERE owner = ? AND ${VISIBLE}`,
    [owner]
  );

  const porSuperficie = await db.getAllAsync(
    `SELECT superficie,
            COUNT(*) AS total,
            SUM(CASE WHEN resultado = 'victoria' THEN 1 ELSE 0 END) AS victorias,
            AVG(primer_saque_pct) AS promedio_primer_saque
     FROM matches WHERE owner = ? AND ${VISIBLE}
     GROUP BY superficie ORDER BY total DESC`,
    [owner]
  );

  const patrones = await db.getAllAsync(
    `SELECT patron_rival AS patron, COUNT(*) AS total
     FROM matches
     WHERE owner = ? AND ${VISIBLE} AND patron_rival <> ''
     GROUP BY patron_rival ORDER BY total DESC LIMIT 5`,
    [owner]
  );

  return {
    total: totals?.total ?? 0,
    victorias: totals?.victorias ?? 0,
    promedioPrimerSaque: Math.round(totals?.promedio_primer_saque ?? 0),
    promedioPuntosSaque: Math.round(totals?.promedio_puntos_saque ?? 0),
    winners: totals?.winners ?? 0,
    errores: totals?.errores ?? 0,
    porSuperficie: porSuperficie.map((r) => ({
      superficie: r.superficie,
      total: r.total,
      victorias: r.victorias,
      promedioPrimerSaque: Math.round(r.promedio_primer_saque ?? 0),
    })),
    patrones,
  };
}

export async function getRivalProfiles(owner) {
  const db = await getDatabase();

  const rivals = await db.getAllAsync(
    `SELECT rival,
            COUNT(*) AS total,
            SUM(CASE WHEN resultado = 'victoria' THEN 1 ELSE 0 END) AS victorias,
            SUM(CASE WHEN resultado = 'derrota' THEN 1 ELSE 0 END) AS derrotas,
            AVG(errores_no_forzados) AS promedio_errores,
            MAX(fecha) AS ultimo
     FROM matches WHERE owner = ? AND ${VISIBLE}
     GROUP BY rival ORDER BY total DESC, rival ASC`,
    [owner]
  );

  const debilidades = await db.getAllAsync(
    `SELECT rival, lado_debil AS lado, COUNT(*) AS total
     FROM matches WHERE owner = ? AND ${VISIBLE} AND lado_debil <> ''
     GROUP BY rival, lado_debil ORDER BY total DESC`,
    [owner]
  );

  const patrones = await db.getAllAsync(
    `SELECT rival, patron_rival AS patron, COUNT(*) AS total
     FROM matches WHERE owner = ? AND ${VISIBLE} AND patron_rival <> ''
     GROUP BY rival, patron_rival ORDER BY total DESC`,
    [owner]
  );

  const topBy = (list, key) => {
    const map = new Map();
    list.forEach((item) => {
      if (!map.has(item.rival)) map.set(item.rival, item[key]);
    });
    return map;
  };

  const ladoMap = topBy(debilidades, 'lado');
  const patronMap = topBy(patrones, 'patron');

  return rivals.map((r) => ({
    rival: r.rival,
    total: r.total,
    victorias: r.victorias,
    derrotas: r.derrotas,
    promedioErrores: Math.round(r.promedio_errores ?? 0),
    ultimo: r.ultimo,
    ladoDebil: ladoMap.get(r.rival) ?? 'Sin datos',
    patronRival: patronMap.get(r.rival) ?? 'Sin datos',
  }));
}

export async function listMatchesByRival(owner, rival) {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM matches WHERE owner = ? AND rival = ? AND ${VISIBLE}
     ORDER BY date(fecha) DESC`,
    [owner, rival]
  );
  return rows.map(mapRow);
}

export async function clearOwnerData(owner) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM matches WHERE owner = ?', [owner]);
}

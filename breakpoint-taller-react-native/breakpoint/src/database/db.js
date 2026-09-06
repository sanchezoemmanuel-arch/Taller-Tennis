import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../constants/config';

let dbPromise = null;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

// Esquema local. Se separa el id local (clave primaria) del remote_id de la API.
export async function initDatabase() {
  const db = await getDatabase();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      remote_id TEXT,
      owner TEXT NOT NULL,
      rival TEXT NOT NULL,
      torneo TEXT NOT NULL,
      superficie TEXT NOT NULL,
      fecha TEXT NOT NULL,
      resultado TEXT NOT NULL,
      marcador TEXT NOT NULL DEFAULT '',
      primer_saque_pct INTEGER NOT NULL DEFAULT 0,
      puntos_ganados_saque INTEGER NOT NULL DEFAULT 0,
      winners INTEGER NOT NULL DEFAULT 0,
      errores_no_forzados INTEGER NOT NULL DEFAULT 0,
      patron_rival TEXT NOT NULL DEFAULT '',
      lado_debil TEXT NOT NULL DEFAULT '',
      notas TEXT NOT NULL DEFAULT '',
      sync_status TEXT NOT NULL DEFAULT 'synced',
      pending_action TEXT,
      remote_simulated INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      updated_at TEXT NOT NULL,
      synced_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_matches_owner ON matches (owner);
    CREATE INDEX IF NOT EXISTS idx_matches_remote ON matches (owner, remote_id);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches (owner, sync_status);
  `);
  return db;
}

export async function resetDatabase() {
  const db = await getDatabase();
  await db.execAsync('DROP TABLE IF EXISTS matches;');
  dbPromise = null;
  await initDatabase();
}

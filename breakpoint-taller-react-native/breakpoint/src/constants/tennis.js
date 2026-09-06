export const SUPERFICIES = [
  { value: 'arcilla', label: 'Arcilla' },
  { value: 'dura', label: 'Dura' },
  { value: 'cesped', label: 'Césped' },
  { value: 'indoor', label: 'Indoor' },
];

export const RESULTADOS = [
  { value: 'victoria', label: 'Victoria' },
  { value: 'derrota', label: 'Derrota' },
];

export const PATRONES = [
  'Saque abierto + derecha invertida',
  'Revés cruzado profundo y espera',
  'Sube a la red tras el servicio',
  'Dejada en punto largo',
  'Segundo saque siempre al revés',
  'Devolución bloqueada al centro',
];

export const LADOS_DEBILES = ['Revés', 'Derecha', 'Segundo saque', 'Volea', 'Devolución', 'Físico'];

export const SYNC_STATES = {
  synced: { label: 'Sincronizado', tone: 'ok' },
  pending: { label: 'Pendiente', tone: 'warn' },
  syncing: { label: 'Sincronizando', tone: 'info' },
  failed: { label: 'Falló', tone: 'error' },
};

export const FILTROS_SUPERFICIE = [{ value: 'todas', label: 'Todas' }, ...SUPERFICIES];
export const FILTROS_RESULTADO = [{ value: 'todos', label: 'Todos' }, ...RESULTADOS];

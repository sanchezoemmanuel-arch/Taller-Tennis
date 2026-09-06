// Configuración central de la aplicación.
// La API elegida es DummyJSON, adaptando el recurso /posts a "partidos de tenis".
export const API_BASE_URL = 'https://dummyjson.com';

export const ENDPOINTS = {
  collection: '/posts',
  detail: (id) => `/posts/${id}`,
  create: '/posts/add',
  update: (id) => `/posts/${id}`,
  remove: (id) => `/posts/${id}`,
  login: '/auth/login',
  me: '/auth/me',
};

// Claves de expo-secure-store (solo admite letras, números, ".", "-" y "_").
export const SECURE_KEYS = {
  token: 'bp.session.token',
  refreshToken: 'bp.session.refresh',
  user: 'bp.session.user',
};

// Claves de AsyncStorage: solo preferencias simples y no sensibles.
export const PREF_KEYS = {
  lastSync: 'bp.prefs.lastSync',
  filters: 'bp.prefs.filters',
};

export const REQUEST_TIMEOUT_MS = 12000;
export const REMOTE_PAGE_LIMIT = 24;
export const DATABASE_NAME = 'breakpoint.db';

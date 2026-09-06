import * as SecureStore from 'expo-secure-store';
import { request } from './httpClient';
import { ENDPOINTS, SECURE_KEYS } from '../constants/config';
import { HttpError } from '../utils/errors';

export async function login({ username, password }) {
  const data = await request(ENDPOINTS.login, {
    method: 'POST',
    body: { username: username.trim(), password, expiresInMins: 60 },
  });

  const token = data?.accessToken || data?.token;
  if (!token) {
    throw new HttpError(500, 'La API respondió sin un token válido. Intenta de nuevo.');
  }

  return {
    token,
    refreshToken: data?.refreshToken ?? null,
    user: {
      id: data?.id ?? null,
      username: data?.username ?? username.trim(),
      firstName: data?.firstName ?? '',
      lastName: data?.lastName ?? '',
      email: data?.email ?? '',
      image: data?.image ?? '',
    },
  };
}

// Envía el token en la cabecera Authorization.
export async function fetchProfile(token) {
  return request(ENDPOINTS.me, { token });
}

export async function saveSession({ token, refreshToken, user }) {
  await SecureStore.setItemAsync(SECURE_KEYS.token, token);
  if (refreshToken) await SecureStore.setItemAsync(SECURE_KEYS.refreshToken, refreshToken);
  await SecureStore.setItemAsync(SECURE_KEYS.user, JSON.stringify(user));
}

export async function loadSession() {
  const token = await SecureStore.getItemAsync(SECURE_KEYS.token);
  if (!token) return null;
  const rawUser = await SecureStore.getItemAsync(SECURE_KEYS.user);
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }
  return { token, user };
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SECURE_KEYS.token);
  await SecureStore.deleteItemAsync(SECURE_KEYS.refreshToken);
  await SecureStore.deleteItemAsync(SECURE_KEYS.user);
}

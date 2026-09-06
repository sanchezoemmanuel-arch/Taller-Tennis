import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../constants/config';
import { HttpError, NetworkError, mapStatusToMessage } from '../utils/errors';

// Cliente HTTP construido sobre fetch (Axios no está permitido en el taller).
export async function request(path, { method = 'GET', body, token, timeout } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout ?? REQUEST_TIMEOUT_MS);

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }
    }

    // Verificación explícita de response.ok antes de usar la respuesta.
    if (!response.ok) {
      throw new HttpError(response.status, mapStatusToMessage(response.status, data), data);
    }

    return data;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error.name === 'AbortError') {
      throw new NetworkError('La solicitud tardó demasiado. Revisa tu conexión y reintenta.');
    }
    throw new NetworkError('No pudimos contactar el servidor. Verifica tu conexión a internet.');
  } finally {
    clearTimeout(timer);
  }
}

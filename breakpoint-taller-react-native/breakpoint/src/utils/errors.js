export class HttpError extends Error {
  constructor(status, message, payload = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
    this.status = 0;
  }
}

// Traduce los códigos HTTP a mensajes entendibles por la persona que usa la app.
export function mapStatusToMessage(status, payload) {
  const apiMessage = typeof payload?.message === 'string' ? payload.message : null;
  switch (status) {
    case 400:
      return apiMessage || 'Los datos enviados no son válidos. Revisa el formulario e inténtalo otra vez.';
    case 401:
      return 'Tu sesión expiró o las credenciales no son correctas. Inicia sesión de nuevo.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El partido que buscas ya no está disponible en el servidor.';
    case 409:
      return 'El registro cambió en el servidor mientras lo editabas.';
    case 422:
      return apiMessage || 'Faltan campos obligatorios o tienen un formato incorrecto.';
    case 429:
      return 'Demasiadas solicitudes seguidas. Espera unos segundos y reintenta.';
    case 500:
    case 502:
    case 503:
      return 'El servidor tuvo un problema. Reintenta en un momento.';
    default:
      return apiMessage || `Error inesperado del servidor (código ${status}).`;
  }
}

export function describeError(error) {
  if (!error) return null;
  if (error instanceof NetworkError) return error.message;
  if (error instanceof HttpError) return error.message;
  return error.message || 'Ocurrió un error inesperado.';
}

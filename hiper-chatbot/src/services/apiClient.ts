import { getAccessToken } from './authStorage';

const DEFAULT_API_BASE_URL = '';

export class ApiError extends Error {
  status?: number;
  userMessage: string;
  serverError?: unknown;

  constructor(message: string, userMessage: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;
    this.serverError = undefined;
  }
}

const getApiBaseUrl = (): string => {
  const envValue = import.meta.env.VITE_API_BASE_URL;
  return envValue && String(envValue).trim().length > 0
    ? String(envValue)
    : DEFAULT_API_BASE_URL;
};

const joinUrl = (baseUrl: string, path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (!baseUrl) {
    return path;
  }
  const needsSlash = !baseUrl.endsWith('/') && !path.startsWith('/');
  const dropSlash = baseUrl.endsWith('/') && path.startsWith('/');
  if (dropSlash) {
    return baseUrl.slice(0, -1) + path;
  }
  if (needsSlash) {
    return `${baseUrl}/${path}`;
  }
  return `${baseUrl}${path}`;
};

export const buildApiUrl = (path: string): string => joinUrl(getApiBaseUrl(), path);

const getUserMessageForStatus = (status?: number): string => {
  if (!status) {
    return 'Ups, algo salio mal. Intenta nuevamente o contacta a soporte.';
  }
  if (status === 401 || status === 403) {
    return 'Tu sesion expiro o no tienes permisos. Inicia sesion nuevamente.';
  }
  if (status === 404) {
    return 'No encontramos la informacion solicitada.';
  }
  if (status === 409) {
    return 'Ya existe una solicitud similar en curso. Continua con tu chat actual o intenta mas tarde.';
  }
  if (status === 422) {
    return 'No pudimos procesar los datos enviados. Revisa e intentalo otra vez.';
  }
  if (status === 429) {
    return 'Se alcanzo el limite de solicitudes. Espera un momento e intentalo otra vez.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'El servicio esta temporalmente inestable. Intenta mas tarde o contacta a soporte.';
  }
  if (status >= 400 && status < 500) {
    return 'No pudimos procesar tu solicitud. Revisa los datos e intentalo otra vez.';
  }
  if (status >= 500) {
    return 'Ups, algo salio mal de nuestro lado. Intenta mas tarde o contacta a soporte.';
  }

  return 'Ups, algo salio mal. Intenta nuevamente o contacta a soporte.';
};

const isNetworkError = (error: unknown): boolean => {
  const errStr = String(error);
  return errStr.includes('Failed to fetch') || errStr.includes('NetworkError') || errStr.includes('TypeError');
};

export const createApiErrorFromStatus = (status?: number, statusText?: string, serverError?: unknown): ApiError => {
  const message = status ? `Request failed with ${status} ${statusText || ''}`.trim() : 'Request failed';
  let userMessage = getUserMessageForStatus(status);

  // Prefer server-provided messages when available
  if (serverError) {
    if (typeof serverError === 'string' && serverError.trim().length > 0) {
      userMessage = serverError;
    } else if (serverError && typeof serverError === 'object') {
      const se = serverError as Record<string, unknown>;
      if (typeof se.detail === 'string' && se.detail.trim().length > 0) {
        userMessage = se.detail;
      } else if (typeof se.message === 'string' && se.message.trim().length > 0) {
        userMessage = se.message;
      }
      // Detect common Postgres RLS failure wording and provide a clearer UX message
      if (String(JSON.stringify(se)).toLowerCase().includes('row-level security') || String(JSON.stringify(se)).includes('42501') || String(JSON.stringify(se)).toLowerCase().includes('new row violates')) {
        userMessage = 'Operacion denegada por politicas de seguridad (RLS) en el servidor. Contacta al equipo backend.';
      }
    }
  }

  const err = new ApiError(message, userMessage, status);
  if (serverError !== undefined) err.serverError = serverError;
  return err;
};

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  if (isNetworkError(error)) {
    return new ApiError(
      'Network error while calling API',
      'No pudimos conectar con el servicio. Verifica tu conexion e intentalo de nuevo.'
    );
  }
  return new ApiError('Unexpected API error', getUserMessageForStatus());
};

export const getUserMessageFromError = (error: unknown): string | null => {
  if (error instanceof ApiError) {
    return error.userMessage;
  }
  if (error && typeof error === 'object' && 'userMessage' in error) {
    const value = (error as { userMessage?: unknown }).userMessage;
    return typeof value === 'string' ? value : null;
  }
  return null;
};

const withAuthHeaders = (headersInit?: HeadersInit): Headers => {
  const headers = new Headers(headersInit || {});
  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

export const apiFetch = (path: string, options: RequestInit = {}): Promise<Response> => {
  const headers = withAuthHeaders(options.headers);
  return fetch(buildApiUrl(path), { ...options, headers });
};

export const apiFetchJson = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    console.log('[apiFetchJson]', options.method || 'GET', path);
    if (typeof options.body === 'string') {
      console.log('[apiFetchJson] body', options.body);
    }
    response = await apiFetch(path, options);
  } catch (error) {
    throw normalizeApiError(error);
  }
  if (!response.ok) {
    let serverErrorBody: unknown = undefined;
    try {
      const txt = await response.clone().text();
      try {
        serverErrorBody = JSON.parse(txt);
      } catch {
        serverErrorBody = txt;
      }
      console.error(`[API Error] ${options.method || 'GET'} ${path} returned status ${response.status}:`, serverErrorBody);
    } catch {
      console.error(`[API Error] ${options.method || 'GET'} ${path} returned status ${response.status} (no body)`);
    }
    throw createApiErrorFromStatus(response.status, response.statusText, serverErrorBody);
  }
  try {
    return await response.json();
  } catch (error) {
    throw normalizeApiError(error);
  }
};

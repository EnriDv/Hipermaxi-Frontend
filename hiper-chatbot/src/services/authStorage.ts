const STORAGE_KEYS = {
  ACCESS_TOKEN: 'hiper_chatbot_access_token',
  PROVIDER_PROFILE: 'hiper_chatbot_provider_profile',
};

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('No se pudo leer el access_token desde localStorage.', error);
    return null;
  }
};

export const setAccessToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.warn('No se pudo guardar el access_token en localStorage.', error);
  }
};

export const clearAccessToken = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('No se pudo limpiar el access_token de localStorage.', error);
  }
};

export const setProviderProfile = (profile: Record<string, any>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROVIDER_PROFILE, JSON.stringify(profile || {}));
  } catch (error) {
    console.warn('No se pudo guardar el perfil del proveedor en localStorage.', error);
  }
};

export const getProviderProfile = (): Record<string, any> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROVIDER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('No se pudo leer el perfil del proveedor desde localStorage.', error);
    return null;
  }
};

export const clearProviderProfile = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROVIDER_PROFILE);
  } catch (error) {
    console.warn('No se pudo limpiar el perfil del proveedor de localStorage.', error);
  }
};

export const isAuthenticated = (): boolean => Boolean(getAccessToken());

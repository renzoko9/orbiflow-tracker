import * as SecureStore from "expo-secure-store";

/**
 * Wrapper sobre expo-secure-store con interfaz simple async.
 * Toda la app accede a almacenamiento seguro a traves de aqui (no SecureStore directo).
 */
export const secureStorage = {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  async getObject<T>(key: string): Promise<T | null> {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  },
};

/** Claves de storage. Una sola fuente de verdad. */
export const STORAGE_KEYS = {
  accessToken: "inout.auth.access_token",
  refreshToken: "inout.auth.refresh_token",
  authState: "inout.auth.state",
} as const;

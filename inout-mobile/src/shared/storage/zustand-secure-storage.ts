import type { PersistStorage, StorageValue } from "zustand/middleware";
import { secureStorage } from "./secure-storage";

/**
 * Adapter de SecureStore para el middleware persist de Zustand.
 * Permite persistir estado sensible (auth) sin exponerlo en AsyncStorage.
 */
export function createSecureZustandStorage<T>(): PersistStorage<T> {
  return {
    async getItem(name): Promise<StorageValue<T> | null> {
      const raw = await secureStorage.get(name);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StorageValue<T>;
      } catch {
        return null;
      }
    },
    async setItem(name, value): Promise<void> {
      await secureStorage.set(name, JSON.stringify(value));
    },
    async removeItem(name): Promise<void> {
      await secureStorage.remove(name);
    },
  };
}

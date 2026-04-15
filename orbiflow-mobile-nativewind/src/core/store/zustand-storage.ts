import { StateStorage } from "zustand/middleware";
import StorageService from "@/src/core/storage/storage.service";

/**
 * Adapter de StorageService para el middleware persist de Zustand.
 * Usa SecureStore en mobile y localStorage en web (delegado a StorageService).
 */
export const zustandStorage: StateStorage = {
  getItem: async (name: string) => {
    return StorageService.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    await StorageService.setItem(name, value);
  },
  removeItem: async (name: string) => {
    await StorageService.removeItem(name);
  },
};

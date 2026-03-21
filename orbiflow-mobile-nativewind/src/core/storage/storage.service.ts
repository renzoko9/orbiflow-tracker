import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Servicio de almacenamiento seguro.
 * Usa expo-secure-store en móvil (Keychain/Keystore) y localStorage en web.
 */
class StorageService {
  private isWeb = Platform.OS === 'web';

  async setItem(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isWeb) {
      localStorage.clear();
    }
    // SecureStore no tiene clear(), se eliminan las keys individualmente
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.setItem(key, jsonValue);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const jsonValue = await this.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  }
}

export default new StorageService();

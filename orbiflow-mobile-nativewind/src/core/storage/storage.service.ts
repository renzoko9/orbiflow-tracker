import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio para manejo de almacenamiento local (AsyncStorage)
 * Gestiona tokens JWT y datos del usuario
 */
class StorageService {
  /**
   * Guarda un valor en el storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error guardando ${key} en storage:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un valor del storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error obteniendo ${key} del storage:`, error);
      return null;
    }
  }

  /**
   * Elimina un valor del storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error eliminando ${key} del storage:`, error);
      throw error;
    }
  }

  /**
   * Limpia completamente el storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error limpiando storage:', error);
      throw error;
    }
  }

  /**
   * Guarda un objeto serializado
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error guardando objeto ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un objeto deserializado
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error obteniendo objeto ${key}:`, error);
      return null;
    }
  }
}

export default new StorageService();

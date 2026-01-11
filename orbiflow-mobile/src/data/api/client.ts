import axios from 'axios';
import { SecureStorage } from '../storage/SecureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4800/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStorage.getRefreshToken();
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStorage.setAccessToken(data.data.access);
        await SecureStorage.setRefreshToken(data.data.refresh);

        originalRequest.headers.Authorization = `Bearer ${data.data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falló, logout
        await SecureStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

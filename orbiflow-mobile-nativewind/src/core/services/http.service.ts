import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { GENERAL_CONSTANTS } from "../constants/general.constant";
import { API_CONFIG, STORAGE_KEYS } from "../config/environment.config";
import { ENDPOINTS } from "../constants/endpoints.constant";
import StorageService from "../storage/storage.service";
import { ResponseAPI } from "../api/dto/api-response.interface";
import { ApiError } from "../api/api-error";
import { useAuthStore } from "../store/auth.store";
import { LoginTokens } from "../dto/auth.interface";

const PUBLIC_ENDPOINTS: string[] = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.register,
  ENDPOINTS.auth.verifyEmail,
  ENDPOINTS.auth.resendVerification,
  ENDPOINTS.auth.forgotPassword,
  ENDPOINTS.auth.verifyResetCode,
  ENDPOINTS.auth.resetPassword,
  ENDPOINTS.auth.refresh,
];

// Mutex para evitar múltiples refresh concurrentes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Servicio HTTP abstracto base
 * Proporciona métodos genéricos para peticiones HTTP usando axios
 * Incluye interceptors para JWT y manejo centralizado de errores
 */
export abstract class HttpService {
  protected api: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.api.url) {
    this.api = axios.create({
      baseURL,
      timeout: GENERAL_CONSTANTS.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Agrega el token JWT solo a rutas protegidas
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const isPublic = PUBLIC_ENDPOINTS.some((ep) =>
          config.url?.includes(ep),
        );

        if (!isPublic) {
          const token = await StorageService.getItem(STORAGE_KEYS.accessToken);

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      },
    );

    // Response interceptor - Maneja respuestas y errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          return this.handleUnauthorized(error);
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Maneja errores 401 intentando refrescar el token.
   * Usa un mutex para que solo una request refresque a la vez;
   * las demás esperan y se reintentan con el nuevo token.
   */
  private async handleUnauthorized(error: AxiosError): Promise<any> {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Evitar loop infinito
    if (originalRequest._retry) {
      await this.clearAuth();
      return Promise.reject(this.handleError(error));
    }

    originalRequest._retry = true;

    // Si ya hay un refresh en curso, encolar esta request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(this.api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await StorageService.getItem(
        STORAGE_KEYS.refreshToken,
      );

      if (!refreshToken) {
        await this.clearAuth();
        return Promise.reject(this.handleError(error));
      }

      // Llamar al endpoint de refresh directamente con axios (sin pasar por interceptors)
      const response = await axios.post<LoginTokens>(
        `${API_CONFIG.api.url}${ENDPOINTS.auth.refresh}`,
        { refreshToken },
      );

      const { access, refresh } = response.data;

      // Guardar nuevos tokens
      await StorageService.setItem(STORAGE_KEYS.accessToken, access);
      if (refresh) {
        await StorageService.setItem(STORAGE_KEYS.refreshToken, refresh);
      }

      // Notificar a las requests encoladas
      onTokenRefreshed(access);

      // Reintentar la request original con el nuevo token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access}`;
      }
      return this.api(originalRequest);
    } catch (refreshError) {
      // Refresh falló — sesión inválida
      refreshSubscribers = [];
      await this.clearAuth();
      return Promise.reject(this.handleError(error));
    } finally {
      isRefreshing = false;
    }
  }

  /**
   * Limpia los datos de autenticación del storage
   */
  private async clearAuth(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.accessToken);
    await StorageService.removeItem(STORAGE_KEYS.refreshToken);
    await StorageService.removeItem(STORAGE_KEYS.userData);
    useAuthStore.getState().logout();
  }

  /**
   * Maneja y formatea errores de axios en un ApiError tipado
   */
  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const response = error.response.data as ResponseAPI;
      return new ApiError(
        {
          message: response?.message || "Error en la petición",
          title: response?.title,
          responseType: response?.responseType,
          errorCode: response?.errorCode,
        },
        error.response.status,
      );
    } else if (error.request) {
      return new ApiError(
        { message: "No se pudo conectar con el servidor" },
        0,
      );
    } else {
      return new ApiError({ message: error.message || "Error desconocido" });
    }
  }

  /**
   * Petición GET genérica
   * @template T - Tipo de respuesta esperado
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  /**
   * Petición POST genérica
   * @template T - Tipo de respuesta esperado
   * @template D - Tipo de datos a enviar
   */
  protected async post<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Petición PUT genérica
   * @template T - Tipo de respuesta esperado
   * @template D - Tipo de datos a enviar
   */
  protected async put<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Petición PATCH genérica
   * @template T - Tipo de respuesta esperado
   * @template D - Tipo de datos a enviar
   */
  protected async patch<T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Petición DELETE genérica
   * @template T - Tipo de respuesta esperado
   */
  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

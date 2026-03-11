import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { GENERAL_CONSTANTS } from "../constants/general.constant";
import { API_CONFIG, STORAGE_KEYS } from "../config/environment.config";
import StorageService from "../storage/storage.service";
import { ResponseAPI } from "../api/dto/api-response.interface";

/**
 * Configuración de error personalizado
 */
interface HttpError {
  message: string;
  status?: number;
  data?: unknown;
}

/**
 * Servicio HTTP abstracto base
 * Proporciona métodos genéricos para peticiones HTTP usando axios
 * Incluye interceptors para JWT y manejo centralizado de errores
 *
 * @abstract
 * @example
 * class AuthService extends HttpService {
 *   async login(data: LoginRequest) {
 *     return this.post<ResponseAPI<LoginResponse>>('/auth/login', data);
 *   }
 * }
 */
export abstract class HttpService {
  protected api: AxiosInstance;

  constructor(baseURL: string = API_CONFIG.api.url) {
    // Crear instancia de axios
    this.api = axios.create({
      baseURL,
      timeout: GENERAL_CONSTANTS.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Configurar interceptors
    this.setupInterceptors();
  }

  /**
   * Configura los interceptors de request y response
   */
  private setupInterceptors(): void {
    // Request interceptor - Agrega el token JWT a cada petición
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await StorageService.getItem(STORAGE_KEYS.accessToken);

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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
        // Si el token expiró (401), intentar refrescar
        if (error.response?.status === 401) {
          return this.handleUnauthorized(error);
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  /**
   * Maneja errores 401 (Unauthorized) intentando refrescar el token
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

    try {
      const refreshToken = await StorageService.getItem(
        STORAGE_KEYS.refreshToken,
      );

      if (!refreshToken) {
        await this.clearAuth();
        return Promise.reject(this.handleError(error));
      }

      // Aquí deberías llamar al endpoint de refresh
      // Por ahora solo limpiamos la autenticación
      // TODO: Implementar refresh token logic
      await this.clearAuth();
      return Promise.reject(this.handleError(error));
    } catch (refreshError) {
      await this.clearAuth();
      return Promise.reject(this.handleError(error));
    }
  }

  /**
   * Limpia los datos de autenticación del storage
   */
  private async clearAuth(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.accessToken);
    await StorageService.removeItem(STORAGE_KEYS.refreshToken);
    await StorageService.removeItem(STORAGE_KEYS.userData);
  }

  /**
   * Maneja y formatea errores de axios
   */
  private handleError(error: AxiosError): HttpError {
    if (error.response) {
      // El servidor respondió con un código de error
      const responseData = error.response.data as ResponseAPI;

      return {
        message: responseData?.message || "Error en la petición",
        status: error.response.status,
        data: responseData?.data,
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        message: "No se pudo conectar con el servidor",
        status: 0,
      };
    } else {
      // Error al configurar la petición
      return {
        message: error.message || "Error desconocido",
      };
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

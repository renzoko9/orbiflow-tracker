import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config";
import { APP_CONSTANTS } from "@/config";
import { secureStorage, STORAGE_KEYS } from "@/shared/storage";
import { ApiError } from "./api-error";
import type { ResponseAPI } from "./response.types";
import { refreshMutex } from "./refresh-mutex";

/**
 * Endpoints publicos que no inyectan token y no disparan refresh ante 401.
 * Mantener la lista corta y especifica.
 */
const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/verify-reset-code",
  "/auth/reset-password",
];

const REFRESH_PATH = "/auth/refresh";

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Hook que el modulo de auth registra para limpiar la sesion cuando
 * el refresh falla. Lo inyectamos para evitar import circular auth -> http -> auth.
 */
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: () => void): void {
  onAuthFailure = handler;
}

function isPublicPath(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_PATHS.some((p) => url.includes(p));
}

function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as ResponseAPI | undefined;
    return new ApiError({
      message: data?.message ?? "Error en la peticion",
      title: data?.title,
      responseType: data?.responseType,
      errorCode: data?.errorCode,
      status: error.response.status,
    });
  }
  if (error.request) {
    return new ApiError({
      message: "No se pudo conectar con el servidor",
      status: 0,
    });
  }
  return new ApiError({ message: error.message ?? "Error desconocido" });
}

async function refreshTokens(client: AxiosInstance): Promise<string> {
  const refreshToken = await secureStorage.get(STORAGE_KEYS.refreshToken);
  if (!refreshToken) throw new Error("Sin refresh token");

  const response = await axios.post<{ access: string; refresh: string }>(
    `${env.EXPO_PUBLIC_API_URL}${REFRESH_PATH}`,
    { refreshToken },
    { timeout: APP_CONSTANTS.api.timeoutMs },
  );

  const { access, refresh } = response.data;
  await secureStorage.set(STORAGE_KEYS.accessToken, access);
  if (refresh) {
    await secureStorage.set(STORAGE_KEYS.refreshToken, refresh);
  }
  return access;
}

function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.EXPO_PUBLIC_API_URL,
    timeout: APP_CONSTANTS.api.timeoutMs,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use(
    async (config) => {
      if (!isPublicPath(config.url)) {
        const token = await secureStorage.get(STORAGE_KEYS.accessToken);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(toApiError(error)),
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as RetryConfig | undefined;

      // Solo intentamos refresh si:
      // - hubo response 401
      // - no es un endpoint publico
      // - no es ya un retry
      const shouldRefresh =
        error.response?.status === 401 &&
        original &&
        !original._retry &&
        !isPublicPath(original.url);

      if (!shouldRefresh) {
        return Promise.reject(toApiError(error));
      }

      original._retry = true;

      // Si ya hay refresh en curso, encolar y reintentar al notificar
      if (refreshMutex.isLocked()) {
        return new Promise((resolve, reject) => {
          refreshMutex.subscribe((newToken) => {
            if (original.headers) {
              original.headers.Authorization = `Bearer ${newToken}`;
            }
            client(original).then(resolve).catch(reject);
          });
        });
      }

      refreshMutex.lock();
      try {
        const newToken = await refreshTokens(client);
        refreshMutex.notify(newToken);
        if (original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return client(original);
      } catch (refreshError) {
        refreshMutex.reject();
        await secureStorage.remove(STORAGE_KEYS.accessToken);
        await secureStorage.remove(STORAGE_KEYS.refreshToken);
        onAuthFailure?.();
        return Promise.reject(toApiError(error));
      } finally {
        refreshMutex.unlock();
      }
    },
  );

  return client;
}

export const httpClient = createHttpClient();

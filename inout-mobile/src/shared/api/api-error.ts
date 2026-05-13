import type { ResponseType } from "./response.types";

interface ApiErrorParams {
  message: string;
  title?: string;
  responseType?: ResponseType;
  errorCode?: string;
  status?: number;
}

/**
 * Error tipado para todas las llamadas HTTP.
 * El httpClient convierte cualquier AxiosError a un ApiError.
 */
export class ApiError extends Error {
  readonly title?: string;
  readonly responseType: ResponseType;
  readonly errorCode?: string;
  readonly status?: number;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = "ApiError";
    this.title = params.title;
    this.responseType = params.responseType ?? "error";
    this.errorCode = params.errorCode;
    this.status = params.status;
  }

  /** Util para chequear errores conocidos del dominio. */
  is(code: string): boolean {
    return this.errorCode === code;
  }
}

/** Type guard. */
export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

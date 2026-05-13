/**
 * Contrato de respuesta estandar del backend (NestJS).
 * Todo endpoint envuelve su payload aqui.
 */
export type ResponseType = "success" | "error" | "info" | "warning";

export interface ResponseAPI<T = unknown> {
  responseType: ResponseType;
  message: string;
  title?: string;
  errorCode?: string;
  data?: T;
}

/** Helper para extraer `data` con fallback. */
export function unwrap<T>(response: ResponseAPI<T>): T {
  if (response.data === undefined) {
    throw new Error(`Respuesta sin data: ${response.message}`);
  }
  return response.data;
}

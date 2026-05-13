/**
 * Codigos de error semanticos del dominio auth.
 * El backend los devuelve en `errorCode`. Mantener sincronizados.
 */
export const AUTH_ERROR_CODES = {
  EMAIL_NOT_VERIFIED: "AUTH_EMAIL_NOT_VERIFIED",
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  EMAIL_TAKEN: "AUTH_EMAIL_TAKEN",
  CODE_INVALID: "AUTH_CODE_INVALID",
  CODE_EXPIRED: "AUTH_CODE_EXPIRED",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * Constantes globales de INOUT.
 * Todo lo de un dominio especifico vive en su feature, no aqui.
 */

export const APP_CONSTANTS = {
  api: {
    timeoutMs: 15_000,
    retryAttempts: 1,
  },
  query: {
    staleTimeMs: 60_000, // 1 minuto
    gcTimeMs: 5 * 60_000, // 5 minutos
  },
  locale: "es-PE",
  currency: "PEN",
  currencySymbol: "S/",
} as const;

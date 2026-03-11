import type { StorageKeysConfig } from "../../src/core/config/environment.types";

// En producción las claves usan un prefijo encriptado para mayor seguridad.
export const StorageKeys = {
  accessToken: "@obf/a1B2c3_tkn",
  refreshToken: "@obf/r7X9y0_ref",
  userData: "@obf/u4K6m8_usr",
} as const satisfies StorageKeysConfig;

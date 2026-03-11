import type { StorageKeysConfig } from "../../src/core/config/environment.types";

export const StorageKeys = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  userData: "user_data",
} as const satisfies StorageKeysConfig;

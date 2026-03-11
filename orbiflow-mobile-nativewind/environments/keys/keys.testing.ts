import type { StorageKeysConfig } from "../../src/core/config/environment.types";

export const StorageKeys = {
  accessToken: "@orbiflow/access_token",
  refreshToken: "@orbiflow/refresh_token",
  userData: "@orbiflow/user_data",
} as const satisfies StorageKeysConfig;

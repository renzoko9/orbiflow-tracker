/**
 * Configuración centralizada de environment.
 * Resuelve automáticamente según APP_ENV: "dev" | "test" | "prod"
 *
 * Scripts de ejemplo:
 *   APP_ENV=dev   → archivos *.development.ts
 *   APP_ENV=test  → archivos *.testing.ts
 *   APP_ENV=prod  → archivos *.ts (producción, default)
 */

import type {
  AppEnv,
  EnvironmentConfig,
  ResolvedEnvironment,
  ServicesConfig,
  StorageKeysConfig,
} from "./environment.types";

type EnvBundle = {
  environment: EnvironmentConfig;
  services: ServicesConfig;
  storageKeys: StorageKeysConfig;
};

const ENV_MAP: Record<AppEnv, () => EnvBundle> = {
  dev: () => ({
    environment: require("../../../environments/environment.development")
      .Environment,
    services: require("../../../environments/services/services.development")
      .Services,
    storageKeys: require("../../../environments/keys/keys.development")
      .StorageKeys,
  }),
  test: () => ({
    environment: require("../../../environments/environment.testing")
      .Environment,
    services: require("../../../environments/services/services.testing")
      .Services,
    storageKeys: require("../../../environments/keys/keys.testing").StorageKeys,
  }),
  prod: () => ({
    environment: require("../../../environments/environment").Environment,
    services: require("../../../environments/services/services").Services,
    storageKeys: require("../../../environments/keys/keys").StorageKeys,
  }),
};

const appEnv = (process.env.APP_ENV ?? "dev") as AppEnv;
const resolvedEnv = (ENV_MAP[appEnv] ?? ENV_MAP.prod)();

export const ENV: EnvironmentConfig = resolvedEnv.environment;
export const API_CONFIG: ServicesConfig = resolvedEnv.services;
export const STORAGE_KEYS: StorageKeysConfig = resolvedEnv.storageKeys;

export const environment: ResolvedEnvironment = {
  ENV,
  API_CONFIG,
  STORAGE_KEYS,
};

if (__DEV__) {
  console.log("Environment:", appEnv);
  console.log("API URL:", API_CONFIG.api.url);
}

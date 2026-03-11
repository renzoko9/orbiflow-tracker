export type AppEnv = "dev" | "test" | "prod";

export interface EnvironmentConfig {
  env: AppEnv;
  showEnvironment: boolean;
  showAppVersion: boolean;
}

export interface ServicesConfig {
  api: {
    url: string;
  };
}

export interface StorageKeysConfig {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly userData: string;
}

export interface ResolvedEnvironment {
  ENV: EnvironmentConfig;
  API_CONFIG: ServicesConfig;
  STORAGE_KEYS: StorageKeysConfig;
}

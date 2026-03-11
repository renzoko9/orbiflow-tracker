export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UserResponse {
  name: string;
  lastname: string;
  email: string;
}

export interface LoginTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  usuario: UserResponse;
  tokens: LoginTokens;
}

export interface RegisterResponse {
  user: UserResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

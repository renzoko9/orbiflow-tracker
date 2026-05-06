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
  id: number;
  name: string;
  lastname: string;
  email: string;
  avatarUrl: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  lastname?: string;
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

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  token: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

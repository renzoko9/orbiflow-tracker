/**
 * DTOs del backend (forma exacta del wire).
 * NO usar en componentes; pasar primero por el mapper.
 */

export interface UserDto {
  id: number;
  name: string;
  lastname: string;
  email: string;
  avatarUrl: string | null;
  emailVerified?: boolean;
  currency?: string;
}

export interface AuthTokensDto {
  access: string;
  refresh: string;
}

export interface LoginResponseDto {
  usuario: UserDto;
  tokens: AuthTokensDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequestDto {
  token: string;
}

export interface ResendVerificationRequestDto {
  email: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface VerifyResetCodeRequestDto {
  token: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

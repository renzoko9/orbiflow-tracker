import { httpClient, type ResponseAPI } from "@/shared/api";
import { secureStorage, STORAGE_KEYS } from "@/shared/storage";
import { useAuthStore } from "@/shared/auth";
import { queryClient } from "@/shared/api";
import {
  type LoginRequestDto,
  type LoginResponseDto,
  type RegisterRequestDto,
  type ForgotPasswordRequestDto,
  type VerifyEmailRequestDto,
  type ResendVerificationRequestDto,
  type VerifyResetCodeRequestDto,
  type ResetPasswordRequestDto,
  userFromDto,
} from "../model";

const PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  forgotPassword: "/auth/forgot-password",
  verifyResetCode: "/auth/verify-reset-code",
  resetPassword: "/auth/reset-password",
} as const;

/**
 * Funciones puras de la API de auth.
 * Cada una hace una llamada HTTP, persiste lo que tenga que persistir
 * y deja al hook que la consume el resto.
 */

export async function login(input: LoginRequestDto): Promise<void> {
  const { data } = await httpClient.post<ResponseAPI<LoginResponseDto>>(
    PATHS.login,
    input,
  );
  const payload = data.data;
  if (!payload) throw new Error("Login sin payload");

  await secureStorage.set(STORAGE_KEYS.accessToken, payload.tokens.access);
  await secureStorage.set(STORAGE_KEYS.refreshToken, payload.tokens.refresh);
  useAuthStore.getState().setUser(userFromDto(payload.usuario));
}

export async function register(
  input: RegisterRequestDto,
): Promise<ResponseAPI> {
  const { data } = await httpClient.post<ResponseAPI>(PATHS.register, input);
  return data;
}

export async function verifyEmail(token: string): Promise<ResponseAPI> {
  const body: VerifyEmailRequestDto = { token };
  const { data } = await httpClient.post<ResponseAPI>(PATHS.verifyEmail, body);
  return data;
}

export async function resendVerification(email: string): Promise<ResponseAPI> {
  const body: ResendVerificationRequestDto = { email };
  const { data } = await httpClient.post<ResponseAPI>(
    PATHS.resendVerification,
    body,
  );
  return data;
}

export async function forgotPassword(email: string): Promise<ResponseAPI> {
  const body: ForgotPasswordRequestDto = { email };
  const { data } = await httpClient.post<ResponseAPI>(
    PATHS.forgotPassword,
    body,
  );
  return data;
}

export async function verifyResetCode(token: string): Promise<ResponseAPI> {
  const body: VerifyResetCodeRequestDto = { token };
  const { data } = await httpClient.post<ResponseAPI>(
    PATHS.verifyResetCode,
    body,
  );
  return data;
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResponseAPI> {
  const body: ResetPasswordRequestDto = { token, newPassword };
  const { data } = await httpClient.post<ResponseAPI>(
    PATHS.resetPassword,
    body,
  );
  return data;
}

export async function logout(): Promise<void> {
  await secureStorage.remove(STORAGE_KEYS.accessToken);
  await secureStorage.remove(STORAGE_KEYS.refreshToken);
  useAuthStore.getState().reset();
  queryClient.clear();
}

import { useMutation } from "@tanstack/react-query";
import * as authApi from "./auth.api";

/**
 * Hooks de auth. Mutations agrupadas en un solo archivo para que
 * todo lo que se puede hacer con auth viva en una pestaña.
 */

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyResetCode(token),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
  });
}

export function useRequestChangePasswordCode() {
  return useMutation({
    mutationFn: authApi.requestChangePasswordCode,
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
  });
}

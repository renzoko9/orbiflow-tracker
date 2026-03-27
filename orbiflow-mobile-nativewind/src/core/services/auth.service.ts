import { HttpService } from './http.service';
import { ENDPOINTS } from '../constants/endpoints.constant';
import { STORAGE_KEYS } from '../config/environment.config';
import StorageService from '../storage/storage.service';
import { ResponseAPI } from '../api/dto/api-response.interface';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  LoginTokens,
  UserResponse,
} from '../dto/auth.interface';

/**
 * Servicio de autenticación
 * Maneja login, registro, refresh de tokens y logout
 */
class AuthService extends HttpService {
  /**
   * Inicia sesión con email y password
   */
  async login(
    credentials: LoginRequest
  ): Promise<ResponseAPI<LoginResponse>> {
    const response = await this.post<ResponseAPI<LoginResponse>, LoginRequest>(
      ENDPOINTS.auth.login,
      credentials
    );

    // Guardar tokens y datos del usuario
    if (response.data?.tokens) {
      await this.saveAuthData(response.data.tokens, response.data.usuario);
    }

    return response;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(
    userData: RegisterRequest
  ): Promise<ResponseAPI<RegisterResponse>> {
    return this.post<ResponseAPI<RegisterResponse>, RegisterRequest>(
      ENDPOINTS.auth.register,
      userData
    );
  }

  /**
   * Verifica el email con el código de 6 dígitos
   */
  async verifyEmail(token: string): Promise<ResponseAPI> {
    return this.post<ResponseAPI, VerifyEmailRequest>(
      ENDPOINTS.auth.verifyEmail,
      { token }
    );
  }

  /**
   * Reenvía el código de verificación al email
   */
  async resendVerification(email: string): Promise<ResponseAPI> {
    return this.post<ResponseAPI, ResendVerificationRequest>(
      ENDPOINTS.auth.resendVerification,
      { email }
    );
  }

  /**
   * Refresca los tokens usando el refresh token
   */
  async refreshToken(): Promise<LoginTokens> {
    const refreshToken = await StorageService.getItem(STORAGE_KEYS.refreshToken);

    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await this.post<LoginTokens, RefreshTokenRequest>(
      ENDPOINTS.auth.refresh,
      { refreshToken }
    );

    await StorageService.setItem(STORAGE_KEYS.accessToken, response.access);
    await StorageService.setItem(STORAGE_KEYS.refreshToken, response.refresh);

    return response;
  }

  async forgotPassword(email: string): Promise<ResponseAPI> {
    return this.post<ResponseAPI, ForgotPasswordRequest>(
      ENDPOINTS.auth.forgotPassword,
      { email }
    );
  }

  async verifyResetCode(token: string): Promise<ResponseAPI> {
    return this.post<ResponseAPI, VerifyResetCodeRequest>(
      ENDPOINTS.auth.verifyResetCode,
      { token }
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<ResponseAPI> {
    return this.post<ResponseAPI, ResetPasswordRequest>(
      ENDPOINTS.auth.resetPassword,
      { token, newPassword }
    );
  }

  async logout(): Promise<void> {
    await StorageService.removeItem(STORAGE_KEYS.accessToken);
    await StorageService.removeItem(STORAGE_KEYS.refreshToken);
    await StorageService.removeItem(STORAGE_KEYS.userData);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await StorageService.getItem(STORAGE_KEYS.accessToken);
    return !!token;
  }

  async getAccessToken(): Promise<string | null> {
    return StorageService.getItem(STORAGE_KEYS.accessToken);
  }

  private async saveAuthData(
    tokens: LoginTokens,
    userData: UserResponse
  ): Promise<void> {
    await StorageService.setItem(STORAGE_KEYS.accessToken, tokens.access);
    await StorageService.setItem(STORAGE_KEYS.refreshToken, tokens.refresh);
    await StorageService.setObject(STORAGE_KEYS.userData, userData);
  }
}

export default new AuthService();

// Contrato para repositorio de autenticación
import { User } from '../entities/User';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }>;
  register(email: string, password: string, name: string): Promise<{ user: User; tokens: AuthTokens }>;
  refreshToken(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
}

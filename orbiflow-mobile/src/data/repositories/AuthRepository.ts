import { User } from '@domain/entities/User';
import { IAuthRepository, AuthTokens } from '@domain/repositories/IAuthRepository';
import { apiClient } from '../api/client';
import { SecureStorage } from '../storage/SecureStorage';
import { UserMapper } from '../mappers/UserMapper';
import { AuthResponseDTO, RefreshTokenResponseDTO, UserResponseDTO } from '../api/dto/AuthDTO';

export class AuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<AuthResponseDTO>('/auth/login', {
      email,
      password,
    });

    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }

    const tokens = response.data.data.tokens;
    await SecureStorage.setTokens(tokens.access, tokens.refresh);

    return {
      user: UserMapper.toDomain(response.data.data),
      tokens,
    };
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<AuthResponseDTO>('/auth/register', {
      email,
      password,
      name,
    });

    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }

    const tokens = response.data.data.tokens;
    await SecureStorage.setTokens(tokens.access, tokens.refresh);

    return {
      user: UserMapper.toDomain(response.data.data),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<RefreshTokenResponseDTO>('/auth/refresh', {
      refreshToken,
    });

    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }

    const tokens = response.data.data;
    await SecureStorage.setTokens(tokens.access, tokens.refresh);

    return tokens;
  }

  async logout(): Promise<void> {
    await SecureStorage.clear();
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserResponseDTO>('/auth/me');

    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }

    return UserMapper.userToDomain(response.data.data);
  }
}

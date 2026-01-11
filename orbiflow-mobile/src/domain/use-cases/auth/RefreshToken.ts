import { IAuthRepository, AuthTokens } from '../../repositories/IAuthRepository';

export class RefreshTokenUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new Error('Refresh token es requerido');
    }

    return await this.authRepository.refreshToken(refreshToken);
  }
}

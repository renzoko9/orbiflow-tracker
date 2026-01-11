import { User } from '../../entities/User';
import { IAuthRepository, AuthTokens } from '../../repositories/IAuthRepository';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Validaciones
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return await this.authRepository.login(email, password);
  }
}

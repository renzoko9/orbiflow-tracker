import { User } from '../../entities/User';
import { IAuthRepository, AuthTokens } from '../../repositories/IAuthRepository';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Validaciones
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('El nombre es requerido');
    }

    return await this.authRepository.register(email, password, name);
  }
}

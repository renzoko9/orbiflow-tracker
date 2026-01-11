// Caso de uso (lógica de negocio)
import { Account } from '../../entities/Account';
import { IAccountRepository } from '../../repositories/IAccountRepository';

export class CreateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(
    name: string,
    balance?: number,
    description?: string
  ): Promise<Account> {
    // Validaciones de negocio
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre de la cuenta es requerido');
    }

    if (balance && balance < 0) {
      throw new Error('El balance no puede ser negativo');
    }

    // Delega la implementación al repository
    return await this.accountRepository.create(name, balance, description);
  }
}

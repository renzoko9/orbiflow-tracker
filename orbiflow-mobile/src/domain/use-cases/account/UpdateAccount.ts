import { Account } from '../../entities/Account';
import { IAccountRepository } from '../../repositories/IAccountRepository';

export class UpdateAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: number, data: Partial<Account>): Promise<Account> {
    if (!id || id <= 0) {
      throw new Error('ID de cuenta inválido');
    }

    if (data.name && data.name.trim().length === 0) {
      throw new Error('El nombre de la cuenta no puede estar vacío');
    }

    if (data.balance !== undefined && data.balance < 0) {
      throw new Error('El balance no puede ser negativo');
    }

    return await this.accountRepository.update(id, data);
  }
}

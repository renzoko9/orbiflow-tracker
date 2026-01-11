import { Account } from '../../entities/Account';
import { IAccountRepository } from '../../repositories/IAccountRepository';

export class GetAccountByIdUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: number): Promise<Account> {
    if (!id || id <= 0) {
      throw new Error('ID de cuenta inválido');
    }

    return await this.accountRepository.getById(id);
  }
}

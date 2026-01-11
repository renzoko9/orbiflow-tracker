import { Account } from '../../entities/Account';
import { IAccountRepository } from '../../repositories/IAccountRepository';

export class GetAccountsUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(): Promise<Account[]> {
    const accounts = await this.accountRepository.getAll();

    // Lógica de negocio: ordenar por balance descendente
    return accounts.sort((a, b) => b.balance - a.balance);
  }
}

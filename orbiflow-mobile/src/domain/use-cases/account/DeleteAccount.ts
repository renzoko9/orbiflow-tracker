import { IAccountRepository } from '../../repositories/IAccountRepository';

export class DeleteAccountUseCase {
  constructor(private accountRepository: IAccountRepository) {}

  async execute(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('ID de cuenta inválido');
    }

    // Validar si la cuenta puede ser eliminada
    const account = await this.accountRepository.getById(id);

    if (!account.canBeDeleted()) {
      throw new Error('Solo se pueden eliminar cuentas con balance $0.00');
    }

    return await this.accountRepository.delete(id);
  }
}

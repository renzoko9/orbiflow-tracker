// Convierte DTO → Entity
import { Account } from '@domain/entities/Account';
import { AccountResponseDTO } from '../api/dto/AccountDTO';

export class AccountMapper {
  static toDomain(dto: AccountResponseDTO['data']): Account {
    if (!dto) throw new Error('Invalid DTO');

    return new Account(
      dto.id,
      dto.name,
      parseFloat(dto.balance), // Convierte string a number
      dto.description,
      new Date(dto.createdAt)
    );
  }

  static toDomainList(dtoList: Array<AccountResponseDTO['data']>): Account[] {
    return dtoList
      .filter(dto => dto !== null && dto !== undefined)
      .map(dto => this.toDomain(dto));
  }

  // Para crear/actualizar (Entity → DTO)
  static toAPI(account: Partial<Account>) {
    return {
      name: account.name,
      balance: account.balance,
      description: account.description,
    };
  }
}

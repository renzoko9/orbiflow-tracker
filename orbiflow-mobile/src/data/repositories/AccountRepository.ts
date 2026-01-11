// Implementación concreta del contrato
import { Account } from '@domain/entities/Account';
import { IAccountRepository } from '@domain/repositories/IAccountRepository';
import { apiClient } from '../api/client';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountResponseDTO, AccountListResponseDTO } from '../api/dto/AccountDTO';

export class AccountRepository implements IAccountRepository {
  async create(name: string, balance?: number, description?: string): Promise<Account> {
    const response = await apiClient.post<AccountResponseDTO>('/accounts', {
      name,
      balance,
      description,
    });

    return AccountMapper.toDomain(response.data.data);
  }

  async getAll(): Promise<Account[]> {
    const response = await apiClient.get<AccountListResponseDTO>('/accounts');

    if (!response.data.data) return [];

    return AccountMapper.toDomainList(response.data.data);
  }

  async getById(id: number): Promise<Account> {
    const response = await apiClient.get<AccountResponseDTO>(`/accounts/${id}`);
    return AccountMapper.toDomain(response.data.data);
  }

  async update(id: number, data: Partial<Account>): Promise<Account> {
    const response = await apiClient.patch<AccountResponseDTO>(
      `/accounts/${id}`,
      AccountMapper.toAPI(data)
    );
    return AccountMapper.toDomain(response.data.data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/accounts/${id}`);
  }
}

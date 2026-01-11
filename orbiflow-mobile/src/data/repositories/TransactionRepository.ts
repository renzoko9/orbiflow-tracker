import { Transaction, TransactionType } from '@domain/entities/Transaction';
import { ITransactionRepository } from '@domain/repositories/ITransactionRepository';
import { apiClient } from '../api/client';
import { TransactionMapper } from '../mappers/TransactionMapper';
import { TransactionListResponseDTO, TransactionResponseDTO } from '../api/dto/TransactionDTO';

export class TransactionRepository implements ITransactionRepository {
  async create(
    amount: number,
    type: TransactionType,
    description: string,
    accountId: number,
    categoryId: number,
    date: Date
  ): Promise<Transaction> {
    const response = await apiClient.post<TransactionResponseDTO>('/transactions', {
      amount,
      type,
      description,
      accountId,
      categoryId,
      date: date.toISOString(),
    });

    return TransactionMapper.toDomain(response.data.data);
  }

  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.get<TransactionListResponseDTO>('/transactions');

    if (!response.data.data) return [];

    return TransactionMapper.toDomainList(response.data.data);
  }

  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get<TransactionResponseDTO>(`/transactions/${id}`);
    return TransactionMapper.toDomain(response.data.data);
  }

  async getByAccount(accountId: number): Promise<Transaction[]> {
    const response = await apiClient.get<TransactionListResponseDTO>(
      `/transactions?accountId=${accountId}`
    );

    if (!response.data.data) return [];

    return TransactionMapper.toDomainList(response.data.data);
  }

  async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const response = await apiClient.patch<TransactionResponseDTO>(
      `/transactions/${id}`,
      TransactionMapper.toAPI(data)
    );
    return TransactionMapper.toDomain(response.data.data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  }
}

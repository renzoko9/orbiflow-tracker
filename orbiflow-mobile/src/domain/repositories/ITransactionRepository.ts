// Contrato para repositorio de transacciones
import { Transaction, TransactionType } from '../entities/Transaction';

export interface ITransactionRepository {
  create(
    amount: number,
    type: TransactionType,
    description: string,
    accountId: number,
    categoryId: number,
    date: Date,
  ): Promise<Transaction>;
  getAll(): Promise<Transaction[]>;
  getById(id: number): Promise<Transaction>;
  getByAccount(accountId: number): Promise<Transaction[]>;
  update(id: number, data: Partial<Transaction>): Promise<Transaction>;
  delete(id: number): Promise<void>;
}

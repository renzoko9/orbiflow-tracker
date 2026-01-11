// Contrato (interface) - NO implementación
import { Account } from '../entities/Account';

export interface IAccountRepository {
  create(name: string, balance?: number, description?: string): Promise<Account>;
  getAll(): Promise<Account[]>;
  getById(id: number): Promise<Account>;
  update(id: number, data: Partial<Account>): Promise<Account>;
  delete(id: number): Promise<void>;
}

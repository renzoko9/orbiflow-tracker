/**
 * DTO del backend.
 * Si la forma diverge del modelo del dominio, agregar mapper.
 * Por ahora coinciden 1:1 (excepto balance: backend manda string, lo dejamos asi).
 */
export interface AccountDto {
  id: number;
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
  userId: number;
  createdAt: string;
  archivedAt: string | null;
}

export interface CreateAccountInput {
  name: string;
  balance?: number;
  description?: string;
  icon?: string;
  color?: string;
}

export interface UpdateAccountInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

/** Modelo de dominio. Por ahora alias del DTO; cuando diverja se separa. */
export type Account = AccountDto;

export function isArchived(account: Account): boolean {
  return account.archivedAt !== null && account.archivedAt !== undefined;
}

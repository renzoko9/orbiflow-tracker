import { httpClient } from "@/shared/api";
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../model";

/**
 * Endpoints de accounts. El backend responde con la entidad cruda
 * (no envuelta en ResponseAPI) para los CRUD.
 */
const PATHS = {
  base: "/accounts",
  byId: (id: number) => `/accounts/${id}`,
  archived: "/accounts/archived",
  restore: (id: number) => `/accounts/${id}/restore`,
} as const;

export async function listAccounts(): Promise<Account[]> {
  const { data } = await httpClient.get<Account[]>(PATHS.base);
  return data;
}

export async function listArchivedAccounts(): Promise<Account[]> {
  const { data } = await httpClient.get<Account[]>(PATHS.archived);
  return data;
}

export async function getAccount(id: number): Promise<Account> {
  const { data } = await httpClient.get<Account>(PATHS.byId(id));
  return data;
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  const { data } = await httpClient.post<Account>(PATHS.base, input);
  return data;
}

export async function updateAccount(
  id: number,
  input: UpdateAccountInput,
): Promise<Account> {
  const { data } = await httpClient.patch<Account>(PATHS.byId(id), input);
  return data;
}

export async function archiveAccount(id: number): Promise<Account> {
  const { data } = await httpClient.delete<Account>(PATHS.byId(id));
  return data;
}

export async function restoreAccount(id: number): Promise<Account> {
  const { data } = await httpClient.patch<Account>(PATHS.restore(id));
  return data;
}

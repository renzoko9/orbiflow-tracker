import { httpClient, type ResponseAPI } from "@/shared/api";
import type {
  CreateTransactionInput,
  FilterTransactionsParams,
  TransactionDetail,
  TransactionListItem,
  TransactionMutationDto,
  UpdateTransactionInput,
} from "../model";

const PATHS = {
  base: "/transactions",
  byId: (id: number) => `/transactions/${id}`,
  byAccount: (accountId: number) => `/transactions/account/${accountId}`,
} as const;

export async function listTransactions(
  filters?: FilterTransactionsParams,
): Promise<TransactionListItem[]> {
  const { data } = await httpClient.get<TransactionListItem[]>(PATHS.base, {
    params: filters,
  });
  return data;
}

export async function listTransactionsByAccount(
  accountId: number,
): Promise<TransactionListItem[]> {
  const { data } = await httpClient.get<TransactionListItem[]>(
    PATHS.byAccount(accountId),
  );
  return data;
}

export async function getTransaction(id: number): Promise<TransactionDetail> {
  const { data } = await httpClient.get<TransactionDetail>(PATHS.byId(id));
  return data;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<ResponseAPI<TransactionMutationDto>> {
  const { data } = await httpClient.post<ResponseAPI<TransactionMutationDto>>(
    PATHS.base,
    input,
  );
  return data;
}

export async function updateTransaction(
  id: number,
  input: UpdateTransactionInput,
): Promise<ResponseAPI<TransactionMutationDto>> {
  const { data } = await httpClient.put<ResponseAPI<TransactionMutationDto>>(
    PATHS.byId(id),
    input,
  );
  return data;
}

export async function deleteTransaction(id: number): Promise<void> {
  await httpClient.delete(PATHS.byId(id));
}

import { httpClient, type ResponseAPI } from "@/shared/api";
import type {
  AccountMovementListItem,
  CreateTransactionInput,
  CreateTransferInput,
  FilterTransactionsParams,
  TransactionDetail,
  TransactionListItem,
  TransactionMutationDto,
  TransferDetail,
  UpdateTransactionInput,
  UpdateTransferInput,
} from "../model";

const PATHS = {
  base: "/transactions",
  byId: (id: number) => `/transactions/${id}`,
  byAccount: (accountId: number) => `/transactions/account/${accountId}`,
  transfer: "/transactions/transfer",
  transferById: (groupId: string) => `/transactions/transfer/${groupId}`,
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
): Promise<AccountMovementListItem[]> {
  const { data } = await httpClient.get<AccountMovementListItem[]>(
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

export async function getTransfer(groupId: string): Promise<TransferDetail> {
  const { data } = await httpClient.get<TransferDetail>(
    PATHS.transferById(groupId),
  );
  return data;
}

export async function createTransfer(
  input: CreateTransferInput,
): Promise<ResponseAPI<TransferDetail>> {
  const { data } = await httpClient.post<ResponseAPI<TransferDetail>>(
    PATHS.transfer,
    input,
  );
  return data;
}

export async function updateTransfer(
  groupId: string,
  input: UpdateTransferInput,
): Promise<ResponseAPI<TransferDetail>> {
  const { data } = await httpClient.patch<ResponseAPI<TransferDetail>>(
    PATHS.transferById(groupId),
    input,
  );
  return data;
}

export async function deleteTransfer(groupId: string): Promise<void> {
  await httpClient.delete(PATHS.transferById(groupId));
}

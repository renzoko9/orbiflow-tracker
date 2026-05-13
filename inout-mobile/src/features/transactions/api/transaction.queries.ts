import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { accountKeys } from "@/features/accounts";
import * as transactionApi from "./transaction.api";
import { transactionKeys } from "./transaction.keys";
import type {
  CreateTransactionInput,
  FilterTransactionsParams,
  UpdateTransactionInput,
} from "../model";

/**
 * Hooks de transactions. Las mutaciones invalidan transactions + accounts
 * porque el balance de la cuenta cambia con cada movimiento.
 */

export function useTransactions(filters?: FilterTransactionsParams) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => transactionApi.listTransactions(filters),
  });
}

export function useTransactionsByAccount(accountId: number | undefined) {
  return useQuery({
    queryKey: transactionKeys.byAccount(accountId ?? -1),
    queryFn: () => transactionApi.listTransactionsByAccount(accountId as number),
    enabled: typeof accountId === "number" && accountId > 0,
  });
}

export function useTransaction(id: number | undefined) {
  return useQuery({
    queryKey: transactionKeys.detail(id ?? -1),
    queryFn: () => transactionApi.getTransaction(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

function invalidateAfterMutation(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: transactionKeys.all });
  qc.invalidateQueries({ queryKey: accountKeys.all });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) =>
      transactionApi.createTransaction(input),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTransactionInput }) =>
      transactionApi.updateTransaction(id, input),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => transactionApi.deleteTransaction(id),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

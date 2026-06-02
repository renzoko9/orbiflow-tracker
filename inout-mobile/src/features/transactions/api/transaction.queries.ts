import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { accountKeys } from "@/features/accounts";
import { insightKeys } from "@/features/insights";
import * as transactionApi from "./transaction.api";
import { transactionKeys } from "./transaction.keys";
import type {
  CreateTransactionInput,
  CreateTransferInput,
  FilterTransactionsParams,
  UpdateTransactionInput,
  UpdateTransferInput,
} from "../model";

/**
 * Hooks de transactions y transfers. Las mutaciones invalidan transactions +
 * accounts (cambia el balance) + insights (cambian las estadisticas).
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
    queryFn: () =>
      transactionApi.listTransactionsByAccount(accountId as number),
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

export function useTransfer(groupId: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.transferDetail(groupId ?? ""),
    queryFn: () => transactionApi.getTransfer(groupId as string),
    enabled: typeof groupId === "string" && groupId.length > 0,
  });
}

function invalidateAfterMutation(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: transactionKeys.all });
  qc.invalidateQueries({ queryKey: accountKeys.all });
  qc.invalidateQueries({ queryKey: insightKeys.all });
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
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: UpdateTransactionInput;
    }) => transactionApi.updateTransaction(id, input),
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

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransferInput) =>
      transactionApi.createTransfer(input),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

export function useUpdateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      input,
    }: {
      groupId: string;
      input: UpdateTransferInput;
    }) => transactionApi.updateTransfer(groupId, input),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

export function useDeleteTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => transactionApi.deleteTransfer(groupId),
    onSuccess: () => invalidateAfterMutation(qc),
  });
}

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as accountApi from "./account.api";
import { accountKeys } from "./account.keys";
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
} from "../model";

/**
 * Hooks de accounts. Queries y mutations agrupadas.
 * Cada mutation invalida los keys que pueda haber afectado.
 */

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: accountApi.listAccounts,
  });
}

export function useArchivedAccounts() {
  return useQuery({
    queryKey: accountKeys.archived(),
    queryFn: accountApi.listArchivedAccounts,
  });
}

export function useAccount(id: number | undefined) {
  return useQuery({
    queryKey: accountKeys.detail(id ?? -1),
    queryFn: () => accountApi.getAccount(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useAccountMonthStats(id: number | undefined) {
  return useQuery({
    queryKey: accountKeys.monthStats(id ?? -1),
    queryFn: () => accountApi.getAccountMonthStats(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountApi.createAccount(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAccountInput }) =>
      accountApi.updateAccount(id, input),
    onSuccess: (updated: Account) => {
      qc.invalidateQueries({ queryKey: accountKeys.lists() });
      qc.setQueryData(accountKeys.detail(updated.id), updated);
    },
  });
}

export function useArchiveAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApi.archiveAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useRestoreAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountApi.restoreAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

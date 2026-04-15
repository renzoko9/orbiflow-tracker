import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { CreateTransactionRequest } from "@/src/core/dto/transaction.interface";
import TransactionService from "@/src/core/services/transaction.service";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      TransactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

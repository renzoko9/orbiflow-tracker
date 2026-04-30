import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import TransactionService from "@/src/core/services/transaction.service";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => TransactionService.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.transactions.detail(id) });
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

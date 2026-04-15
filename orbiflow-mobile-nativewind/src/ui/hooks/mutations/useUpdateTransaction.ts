import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import {
  UpdateTransactionRequest,
  TransactionResponse,
} from "@/src/core/dto/transaction.interface";
import { ResponseAPI } from "@/src/core/api/dto/api-response.interface";
import TransactionService from "@/src/core/services/transaction.service";

export function useUpdateTransaction(id: number) {
  const queryClient = useQueryClient();

  return useMutation<ResponseAPI<TransactionResponse>, Error, UpdateTransactionRequest>({
    mutationFn: (data) => TransactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

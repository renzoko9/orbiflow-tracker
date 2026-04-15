import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import TransactionService from "@/src/core/services/transaction.service";

export function useTransaction(id: number) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => TransactionService.findOne(id),
    enabled: !!id,
  });
}

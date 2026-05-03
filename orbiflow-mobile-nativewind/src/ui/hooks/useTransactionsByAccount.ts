import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import TransactionService from "@/src/core/services/transaction.service";

export function useTransactionsByAccount(accountId: number) {
  return useQuery({
    queryKey: queryKeys.transactions.byAccount(accountId),
    queryFn: () => TransactionService.findByAccount(accountId),
    enabled: !!accountId,
  });
}

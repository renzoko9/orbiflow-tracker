import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { FilterTransactionsParams } from "@/src/core/dto/transaction.interface";
import TransactionService from "@/src/core/services/transaction.service";

export function useTransactions(filters?: FilterTransactionsParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => TransactionService.findAll(filters),
  });
}

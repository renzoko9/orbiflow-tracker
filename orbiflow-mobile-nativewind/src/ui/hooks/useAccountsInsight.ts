import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import InsightService from "@/src/core/services/insight.service";

export function useAccountsInsight() {
  return useQuery({
    queryKey: queryKeys.insights.accounts,
    queryFn: () => InsightService.getAccounts(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import InsightService from "@/src/core/services/insight.service";

export function useMonthlyInsight() {
  return useQuery({
    queryKey: queryKeys.insights.monthly,
    queryFn: () => InsightService.getMonthly(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

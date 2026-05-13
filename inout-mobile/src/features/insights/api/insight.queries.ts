import { useQuery } from "@tanstack/react-query";
import * as insightApi from "./insight.api";
import { insightKeys } from "./insight.keys";

/**
 * Insights se generan con IA: cachear agresivamente y refetch poco.
 */
const INSIGHT_STALE = 10 * 60 * 1000;

export function useMonthlyInsight() {
  return useQuery({
    queryKey: insightKeys.monthly(),
    queryFn: insightApi.getMonthlyInsight,
    staleTime: INSIGHT_STALE,
  });
}

export function useAccountsInsight() {
  return useQuery({
    queryKey: insightKeys.accounts(),
    queryFn: insightApi.getAccountsInsight,
    staleTime: INSIGHT_STALE,
  });
}

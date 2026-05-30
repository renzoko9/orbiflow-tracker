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

/**
 * Stats deterministas (no IA): refrescan mas seguido que los insights.
 */
const STATS_STALE = 2 * 60 * 1000;

export function useInsightStats() {
  return useQuery({
    queryKey: insightKeys.stats(),
    queryFn: insightApi.getInsightStats,
    staleTime: STATS_STALE,
  });
}

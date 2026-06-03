import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as insightApi from "./insight.api";
import { insightKeys } from "./insight.keys";

/**
 * Insights se generan con IA: cachear agresivamente y refetch poco.
 */
const INSIGHT_STALE = 10 * 60 * 1000;

export function useMonthlyInsight(
  params: insightApi.MonthlyInsightParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: insightKeys.monthly(params.year, params.month),
    queryFn: () => insightApi.getMonthlyInsight(params),
    staleTime: INSIGHT_STALE,
    enabled: options.enabled ?? true,
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

export function useInsightStats(params: insightApi.InsightStatsParams = {}) {
  return useQuery({
    queryKey: insightKeys.stats(params.year, params.month),
    queryFn: () => insightApi.getInsightStats(params),
    staleTime: STATS_STALE,
    placeholderData: keepPreviousData,
  });
}

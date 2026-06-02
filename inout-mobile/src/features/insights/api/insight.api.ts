import { httpClient } from "@/shared/api";
import type { Insight, InsightStats } from "../model";

const PATHS = {
  monthly: "/insights/monthly",
  accounts: "/insights/accounts",
  stats: "/insights/stats",
} as const;

export interface InsightStatsParams {
  year?: number;
  month?: number | null;
}

export async function getInsightStats(
  params: InsightStatsParams = {},
): Promise<InsightStats> {
  const { data } = await httpClient.get<InsightStats>(PATHS.stats, {
    params: {
      ...(params.year != null && { year: params.year }),
      ...(params.month != null && { month: params.month }),
    },
  });
  return data;
}

export async function getMonthlyInsight(): Promise<Insight> {
  const { data } = await httpClient.get<Insight>(PATHS.monthly);
  return data;
}

export async function getAccountsInsight(): Promise<Insight> {
  const { data } = await httpClient.get<Insight>(PATHS.accounts);
  return data;
}

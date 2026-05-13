import { httpClient } from "@/shared/api";
import type { Insight } from "../model";

const PATHS = {
  monthly: "/insights/monthly",
  accounts: "/insights/accounts",
} as const;

export async function getMonthlyInsight(): Promise<Insight> {
  const { data } = await httpClient.get<Insight>(PATHS.monthly);
  return data;
}

export async function getAccountsInsight(): Promise<Insight> {
  const { data } = await httpClient.get<Insight>(PATHS.accounts);
  return data;
}

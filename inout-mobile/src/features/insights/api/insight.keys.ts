export const insightKeys = {
  all: ["insights"] as const,
  monthly: (year?: number, month?: number | null) =>
    [...insightKeys.all, "monthly", year ?? null, month ?? null] as const,
  accounts: () => [...insightKeys.all, "accounts"] as const,
  stats: (year?: number, month?: number | null) =>
    [...insightKeys.all, "stats", year ?? null, month ?? null] as const,
};

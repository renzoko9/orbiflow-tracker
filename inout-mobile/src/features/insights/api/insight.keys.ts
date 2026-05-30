export const insightKeys = {
  all: ["insights"] as const,
  monthly: () => [...insightKeys.all, "monthly"] as const,
  accounts: () => [...insightKeys.all, "accounts"] as const,
  stats: () => [...insightKeys.all, "stats"] as const,
};

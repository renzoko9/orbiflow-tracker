/**
 * Query keys de accounts. Centralizar evita typos y permite invalidar
 * con precision (e.g. invalidar solo .archived).
 */
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  archived: () => [...accountKeys.all, "archived"] as const,
  detail: (id: number) => [...accountKeys.all, "detail", id] as const,
};

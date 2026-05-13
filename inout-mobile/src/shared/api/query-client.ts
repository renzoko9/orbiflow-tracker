import { QueryClient } from "@tanstack/react-query";
import { APP_CONSTANTS } from "@/config";
import { isApiError } from "./api-error";

/**
 * Cliente unico de React Query.
 * - No reintenta errores 4xx (errores de cliente, retry no resuelve).
 * - Reintenta una vez para errores de red u otros 5xx.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: APP_CONSTANTS.query.staleTimeMs,
      gcTime: APP_CONSTANTS.query.gcTimeMs,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          const status = error.status ?? 0;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < APP_CONSTANTS.api.retryAttempts;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

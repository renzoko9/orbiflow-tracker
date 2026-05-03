import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import AccountService from "@/src/core/services/account.service";

export function useRestoreAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AccountService.restore(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.all });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.archived });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.detail(id) });
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import AccountService from "@/src/core/services/account.service";

export function useArchiveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AccountService.archive(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.accounts.detail(id) });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.all });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.archived });
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

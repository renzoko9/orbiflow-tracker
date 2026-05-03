import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { UpdateAccountRequest } from "@/src/core/dto/account.interface";
import AccountService from "@/src/core/services/account.service";

export function useUpdateAccount(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAccountRequest) =>
      AccountService.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.all });
      queryClient.refetchQueries({ queryKey: queryKeys.accounts.detail(id) });
    },
  });
}

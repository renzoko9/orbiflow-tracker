import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { CreateAccountRequest } from "@/src/core/dto/account.interface";
import AccountService from "@/src/core/services/account.service";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => AccountService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import AccountService from "@/src/core/services/account.service";

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => AccountService.findAll(),
  });
}

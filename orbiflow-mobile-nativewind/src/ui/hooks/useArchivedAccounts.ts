import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import AccountService from "@/src/core/services/account.service";

export function useArchivedAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.archived,
    queryFn: () => AccountService.findArchived(),
  });
}

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import AccountService from "@/src/core/services/account.service";

export function useAccount(id: number) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => AccountService.findOne(id),
    enabled: !!id,
  });
}

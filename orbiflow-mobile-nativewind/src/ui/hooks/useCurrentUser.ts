import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import UserService from "@/src/core/services/user.service";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => UserService.getMe(),
  });
}

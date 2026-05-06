import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { UserResponse } from "@/src/core/dto/auth.interface";
import UserService from "@/src/core/services/user.service";
import { useAuthStore } from "@/src/core/store";
import StorageService from "@/src/core/storage/storage.service";
import { STORAGE_KEYS } from "@/src/core/config/environment.config";

async function syncUser(user: UserResponse) {
  useAuthStore.getState().setUser(user);
  await StorageService.setObject(STORAGE_KEYS.userData, user);
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserService.deleteAvatar(),
    onSuccess: async (user) => {
      await syncUser(user);
      queryClient.setQueryData(queryKeys.users.me, user);
    },
  });
}

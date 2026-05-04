import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import CategoryService from "@/src/core/services/category.service";

export function useRestoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryService.restore(id),
    onSuccess: (_, id) => {
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all });
      queryClient.refetchQueries({ queryKey: queryKeys.categories.archived });
      queryClient.refetchQueries({ queryKey: queryKeys.categories.detail(id) });
    },
  });
}

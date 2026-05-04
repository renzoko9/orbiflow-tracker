import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import CategoryService from "@/src/core/services/category.service";

export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoryService.archive(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all });
      queryClient.refetchQueries({ queryKey: queryKeys.categories.archived });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import { UpdateCategoryRequest } from "@/src/core/dto/category.interface";
import CategoryService from "@/src/core/services/category.service";

export function useUpdateCategory(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      CategoryService.update(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: queryKeys.categories.all });
      queryClient.refetchQueries({ queryKey: queryKeys.categories.detail(id) });
      queryClient.refetchQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}

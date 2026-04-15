import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import {
  CreateCategoryRequest,
  Category,
} from "@/src/core/dto/category.interface";
import { ResponseAPI } from "@/src/core/api/dto/api-response.interface";
import CategoryService from "@/src/core/services/category.service";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation<ResponseAPI<Category>, Error, CreateCategoryRequest>({
    mutationFn: (data) => CategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
}

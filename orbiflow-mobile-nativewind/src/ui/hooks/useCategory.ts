import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import CategoryService from "@/src/core/services/category.service";

export function useCategory(id: number) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => CategoryService.findOne(id),
    enabled: !!id,
  });
}

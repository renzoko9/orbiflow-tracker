import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import CategoryService from "@/src/core/services/category.service";

export function useArchivedCategories() {
  return useQuery({
    queryKey: queryKeys.categories.archived,
    queryFn: () => CategoryService.findArchived(),
  });
}

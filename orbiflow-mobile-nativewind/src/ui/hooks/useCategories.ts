import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { queryKeys } from "@/src/core/constants/query-keys.constant";
import CategoryService from "@/src/core/services/category.service";

interface UseCategoriesOptions {
  type?: CategoryType;
}

export function useCategories(options?: UseCategoriesOptions) {
  const query = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => CategoryService.findAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos — categorías casi nunca cambian
  });

  const filtered = useMemo(
    () =>
      options?.type
        ? (query.data?.filter((c) => c.type === options.type) ?? [])
        : (query.data ?? []),
    [query.data, options?.type],
  );

  return { ...query, data: filtered };
}

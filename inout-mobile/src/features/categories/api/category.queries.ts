import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as categoryApi from "./category.api";
import { categoryKeys } from "./category.keys";
import type {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../model";

interface UseCategoriesOptions {
  type?: CategoryType;
}

/**
 * Listado de categorias del usuario + globales.
 * Usamos staleTime alto porque cambian muy poco.
 * Filtrado por tipo se hace en cliente para evitar nuevas requests.
 */
export function useCategories(options?: UseCategoriesOptions) {
  const query = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: categoryApi.listCategories,
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo<Category[]>(() => {
    if (!query.data) return [];
    if (!options?.type) return query.data;
    return query.data.filter((c) => c.type === options.type);
  }, [query.data, options?.type]);

  return { ...query, data: filtered };
}

export function useArchivedCategories() {
  return useQuery({
    queryKey: categoryKeys.archived(),
    queryFn: categoryApi.listArchivedCategories,
  });
}

export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id ?? -1),
    queryFn: () => categoryApi.getCategory(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      categoryApi.createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCategoryInput }) =>
      categoryApi.updateCategory(id, input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      qc.setQueryData(categoryKeys.detail(updated.id), updated);
    },
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.archiveCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

export function useRestoreCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoryApi.restoreCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

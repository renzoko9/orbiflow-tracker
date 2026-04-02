import { useState, useEffect, useMemo } from "react";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { Category } from "@/src/core/dto/category.interface";
import CategoryService from "@/src/core/services/category.service";

interface UseCategoriesOptions {
  type?: CategoryType;
}

export function useCategories(options?: UseCategoriesOptions) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await CategoryService.findAll();
      setAllCategories(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categories = useMemo(
    () =>
      options?.type
        ? allCategories.filter((c) => c.type === options.type)
        : allCategories,
    [allCategories, options?.type],
  );

  return { categories, loading, error, refetch: fetchCategories };
}

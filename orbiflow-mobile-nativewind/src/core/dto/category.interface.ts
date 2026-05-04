import { CategoryType } from "@/src/core/enums/category-type.enum";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  userId: number | null; // null = categoría global
  createdAt: string;
  archivedAt: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
}

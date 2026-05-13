/**
 * Coincide con backend/.../common/enum/category-type.enum.ts (Income=1, Expense=2).
 * Mantener en sync.
 */
export enum CategoryType {
  INCOME = 1,
  EXPENSE = 2,
}

/**
 * DTO crudo del backend.
 */
export interface CategoryDto {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  userId: number | null; // null = categoria global predeterminada
  createdAt: string;
  archivedAt: string | null;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  color?: string;
}

/** Modelo de dominio. Por ahora alias del DTO; cuando diverja, separar. */
export type Category = CategoryDto;

export function isGlobalCategory(category: Category): boolean {
  return category.userId === null;
}

export function isArchivedCategory(category: Category): boolean {
  return category.archivedAt !== null && category.archivedAt !== undefined;
}

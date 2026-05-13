import { httpClient, type ResponseAPI } from "@/shared/api";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../model";

/**
 * Endpoints de categories.
 * Nota backend: POST devuelve ResponseAPI<Category>; el resto devuelve la entidad cruda.
 */
const PATHS = {
  base: "/categories",
  byId: (id: number) => `/categories/${id}`,
  archived: "/categories/archived",
  global: "/categories/global",
  restore: (id: number) => `/categories/${id}/restore`,
} as const;

export async function listCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>(PATHS.base);
  return data;
}

export async function listGlobalCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>(PATHS.global);
  return data;
}

export async function listArchivedCategories(): Promise<Category[]> {
  const { data } = await httpClient.get<Category[]>(PATHS.archived);
  return data;
}

export async function getCategory(id: number): Promise<Category> {
  const { data } = await httpClient.get<Category>(PATHS.byId(id));
  return data;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ResponseAPI<Category>> {
  const { data } = await httpClient.post<ResponseAPI<Category>>(
    PATHS.base,
    input,
  );
  return data;
}

export async function updateCategory(
  id: number,
  input: UpdateCategoryInput,
): Promise<Category> {
  const { data } = await httpClient.put<Category>(PATHS.byId(id), input);
  return data;
}

export async function archiveCategory(id: number): Promise<Category> {
  const { data } = await httpClient.delete<Category>(PATHS.byId(id));
  return data;
}

export async function restoreCategory(id: number): Promise<Category> {
  const { data } = await httpClient.patch<Category>(PATHS.restore(id));
  return data;
}

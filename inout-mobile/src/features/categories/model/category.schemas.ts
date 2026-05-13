import { z } from "zod";
import { CategoryType } from "./category.types";

const name = z
  .string()
  .min(1, "El nombre es obligatorio")
  .max(50, "Maximo 50 caracteres");

const icon = z.string().min(1, "Selecciona un icono");
const color = z.string().min(1, "Selecciona un color");

export const createCategorySchema = z.object({
  name,
  type: z.nativeEnum(CategoryType),
  icon,
  color,
});
export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name,
  icon,
  color,
});
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

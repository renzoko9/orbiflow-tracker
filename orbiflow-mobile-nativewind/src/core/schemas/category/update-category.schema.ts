import { z } from "zod";
import { CategoryType } from "@/src/core/enums/category-type.enum";

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  type: z.nativeEnum(CategoryType).optional(),
  icon: z.string().min(1, "Selecciona un icono"),
  color: z.string().min(1, "Selecciona un color"),
});

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

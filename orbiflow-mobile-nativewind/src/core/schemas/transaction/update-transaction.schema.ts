import { z } from "zod";
import { CategoryType } from "@/src/core/enums/category-type.enum";

export const updateTransactionSchema = z.object({
  amount: z
    .number({ error: "El monto debe ser un número" })
    .positive("El monto debe ser mayor a 0"),
  type: z.nativeEnum(CategoryType, {
    error: "El tipo es requerido",
  }),
  date: z.string().min(1, "La fecha es requerida"),
  accountId: z
    .number({ error: "La cuenta es requerida" })
    .positive("Selecciona una cuenta"),
  categoryId: z
    .number({ error: "La categoría es requerida" })
    .positive("Selecciona una categoría"),
  description: z
    .string({ error: "La descripción es requerida" })
    .min(1, "La descripción es requerida"),
});

export type UpdateTransactionFormValues = z.infer<
  typeof updateTransactionSchema
>;

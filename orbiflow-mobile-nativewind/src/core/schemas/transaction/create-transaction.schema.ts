import { z } from "zod";
import { CategoryType } from "@/src/core/enums/category-type.enum";

export const createTransactionSchema = z.object({
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
  categoryId: z.number().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
});

export type CreateTransactionFormValues = z.infer<
  typeof createTransactionSchema
>;

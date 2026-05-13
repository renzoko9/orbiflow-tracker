import { z } from "zod";
import { CategoryType } from "@/features/categories";

export const createTransactionSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un numero" })
    .positive("El monto debe ser mayor a cero"),
  description: z.string().max(200, "Maximo 200 caracteres").optional(),
  type: z.nativeEnum(CategoryType),
  date: z.string().min(1, "La fecha es obligatoria"),
  categoryId: z.number().int().positive().optional(),
  accountId: z
    .number({ message: "Selecciona una cuenta" })
    .int()
    .positive("Selecciona una cuenta"),
});
export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.partial();
export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;

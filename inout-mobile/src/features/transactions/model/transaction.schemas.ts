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

/**
 * Schema unificado usado por el TransactionForm. Cubre los 3 kinds
 * (gasto, ingreso, transferencia) en un solo react-hook-form para no
 * duplicar logica. Los campos no aplicables al kind activo se ignoran
 * en el superRefine y al armar el payload.
 */
export const transactionFormSchema = z
  .object({
    kind: z.enum(["movement", "transfer"]),
    amount: z
      .number({ message: "El monto debe ser un numero" })
      .positive("El monto debe ser mayor a cero"),
    description: z.string().max(200, "Maximo 200 caracteres").optional(),
    date: z.string().min(1, "La fecha es obligatoria"),
    type: z.nativeEnum(CategoryType).optional(),
    categoryId: z.number().int().positive().optional(),
    accountId: z.number().int().positive().optional(),
    sourceAccountId: z.number().int().positive().optional(),
    destinationAccountId: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "movement") {
      if (data.type === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["type"],
          message: "Selecciona gasto o ingreso",
        });
      }
      if (data.accountId === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountId"],
          message: "Selecciona una cuenta",
        });
      }
      return;
    }
    if (data.sourceAccountId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sourceAccountId"],
        message: "Selecciona la cuenta origen",
      });
    }
    if (data.destinationAccountId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destinationAccountId"],
        message: "Selecciona la cuenta destino",
      });
    }
    if (
      data.sourceAccountId !== undefined &&
      data.destinationAccountId !== undefined &&
      data.sourceAccountId === data.destinationAccountId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destinationAccountId"],
        message: "La cuenta destino debe ser distinta del origen",
      });
    }
  });
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

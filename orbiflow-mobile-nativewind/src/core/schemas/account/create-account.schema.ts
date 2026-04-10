import { z } from "zod";

export const createAccountSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  balance: z
    .number({ error: "El balance debe ser un número" })
    .min(0, "El balance no puede ser negativo")
    .optional(),
  description: z.string().max(100, "Máximo 100 caracteres").optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

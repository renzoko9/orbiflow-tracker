import { z } from "zod";

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  description: z.string().max(100, "Máximo 100 caracteres").optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;

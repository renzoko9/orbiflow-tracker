import { z } from "zod";

const name = z
  .string()
  .min(1, "El nombre es obligatorio")
  .max(50, "Maximo 50 caracteres");

const description = z
  .string()
  .max(100, "Maximo 100 caracteres")
  .optional();

export const createAccountSchema = z.object({
  name,
  balance: z
    .number({ message: "El balance debe ser un numero" })
    .min(0, "El balance no puede ser negativo")
    .optional(),
  description,
  icon: z.string().optional(),
  color: z.string().optional(),
});
export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name,
  description,
  icon: z.string().optional(),
  color: z.string().optional(),
});
export type UpdateAccountFormValues = z.infer<typeof updateAccountSchema>;

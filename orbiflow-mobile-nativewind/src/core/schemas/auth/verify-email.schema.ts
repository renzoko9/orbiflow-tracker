import { z } from "zod";

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El código solo debe contener números"),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

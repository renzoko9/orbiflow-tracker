import { z } from "zod";
import { EMAIL_REGEX } from "./login.schema";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .regex(EMAIL_REGEX, "Ingresa un correo válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

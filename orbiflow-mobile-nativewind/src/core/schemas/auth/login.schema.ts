import { z } from "zod";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .regex(EMAIL_REGEX, "Ingresa un correo válido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "Mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

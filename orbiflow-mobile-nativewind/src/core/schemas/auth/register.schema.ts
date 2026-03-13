import { z } from "zod";
import { EMAIL_REGEX } from "./login.schema";

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    lastname: z.string().min(1, "El apellido es requerido"),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .regex(EMAIL_REGEX, "Ingresa un correo válido"),
    password: z
      .string()
      .min(6, "Mínimo 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

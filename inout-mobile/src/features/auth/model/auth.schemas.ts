import { z } from "zod";

const email = z
  .string()
  .min(1, "El correo es obligatorio")
  .email("Correo invalido");

const password = z
  .string()
  .min(8, "Minimo 8 caracteres")
  .max(72, "Maximo 72 caracteres");

const code = z
  .string()
  .length(6, "El codigo debe tener 6 digitos")
  .regex(/^\d+$/, "Solo numeros");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    lastname: z.string().min(1, "El apellido es obligatorio"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({ code });
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const verifyCodeSchema = z.object({ code });
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

export const newPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

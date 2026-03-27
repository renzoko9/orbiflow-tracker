import { z } from "zod";

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El código solo debe contener números"),
});

export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

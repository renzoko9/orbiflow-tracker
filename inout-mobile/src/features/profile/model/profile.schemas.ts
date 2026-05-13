import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

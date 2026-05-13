import { z } from "zod";

/**
 * Validacion de variables de entorno al arranque.
 *
 * Si falta alguna variable obligatoria, la app falla con un mensaje claro
 * en vez de propagarse como `undefined` y romper en runtime.
 *
 * Solo las variables EXPO_PUBLIC_* son visibles en el bundle.
 */
const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .url({ message: "EXPO_PUBLIC_API_URL debe ser una URL valida" }),
  EXPO_PUBLIC_APP_ENV: z
    .enum(["development", "testing", "production"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Variables de entorno invalidas:\n${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.EXPO_PUBLIC_APP_ENV === "production";
export const isDevelopment = env.EXPO_PUBLIC_APP_ENV === "development";

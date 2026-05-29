import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { env } from "@/config";

function getMediaBaseUrl(): string {
  return env.EXPO_PUBLIC_API_URL.replace(/\/api\/v\d+\/?$/, "");
}

/** Convierte un avatar relativo del backend en una URL absoluta. */
export function resolveAvatarUrl(
  relativeUrl: string | null | undefined,
): string | null {
  if (!relativeUrl) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(relativeUrl)) return relativeUrl;
  return `${getMediaBaseUrl()}${relativeUrl}`;
}

export interface NormalizedImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

/**
 * Convierte cualquier imagen (incluyendo HEIC de iOS) a JPEG.
 * El backend solo acepta JPG/PNG/WEBP, asi que normalizamos en el cliente.
 */
export async function normalizeImageToJpeg(
  uri: string,
  compress = 0.7,
): Promise<NormalizedImage> {
  const ctx = ImageManipulator.manipulate(uri);
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress,
  });
  return {
    uri: result.uri,
    mimeType: "image/jpeg",
    fileName: `image-${Date.now()}.jpg`,
  };
}

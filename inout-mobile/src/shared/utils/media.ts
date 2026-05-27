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

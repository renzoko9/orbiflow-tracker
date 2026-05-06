import { API_CONFIG } from "../config/environment.config";

function getMediaBaseUrl(): string {
  return API_CONFIG.api.url.replace(/\/api\/v\d+\/?$/, "");
}

export function resolveAvatarUrl(
  relativeUrl: string | null | undefined,
): string | null {
  if (!relativeUrl) return null;
  if (/^https?:\/\//.test(relativeUrl)) return relativeUrl;
  return `${getMediaBaseUrl()}${relativeUrl}`;
}

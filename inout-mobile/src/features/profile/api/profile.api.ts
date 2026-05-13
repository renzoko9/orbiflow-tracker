import { httpClient } from "@/shared/api";
import { useAuthStore, type AuthUser } from "@/shared/auth";
import type { UpdateProfileInput } from "../model";

/**
 * Servicios del perfil. Cada operacion devuelve el user actualizado y
 * actualiza el auth store para mantener la UI sincronizada.
 */

const PATHS = {
  me: "/users/me",
  avatar: "/users/me/avatar",
} as const;

export async function getMe(): Promise<AuthUser> {
  const { data } = await httpClient.get<AuthUser>(PATHS.me);
  return data;
}

export async function updateMe(input: UpdateProfileInput): Promise<AuthUser> {
  const { data } = await httpClient.patch<AuthUser>(PATHS.me, input);
  useAuthStore.getState().setUser(data);
  return data;
}

export async function uploadAvatar(
  uri: string,
  mimeType: string,
): Promise<AuthUser> {
  const form = new FormData();
  const filename = uri.split("/").pop() ?? "avatar.jpg";
  form.append("avatar", {
    uri,
    name: filename,
    type: mimeType,
    // RN FormData requires this any cast
  } as unknown as Blob);

  const { data } = await httpClient.post<AuthUser>(PATHS.avatar, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  useAuthStore.getState().setUser(data);
  return data;
}

export async function deleteAvatar(): Promise<AuthUser> {
  const { data } = await httpClient.delete<AuthUser>(PATHS.avatar);
  useAuthStore.getState().setUser(data);
  return data;
}

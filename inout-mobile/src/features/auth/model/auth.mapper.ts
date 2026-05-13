import type { AuthUser } from "@/shared/auth";
import type { UserDto } from "./auth.dto";

/**
 * Mapper DTO -> dominio.
 * Si el backend cambia la forma del usuario, solo se ajusta aqui.
 */
export function userFromDto(dto: UserDto): AuthUser {
  return {
    id: dto.id,
    name: dto.name,
    lastname: dto.lastname,
    email: dto.email,
    avatarUrl: dto.avatarUrl ?? null,
    emailVerified: dto.emailVerified ?? true,
  };
}

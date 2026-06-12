/**
 * Tipos de dominio para usuario autenticado.
 * NO son DTOs del backend; los mappers de la feature auth se encargan
 * de traducir entre el DTO y este modelo si la forma diverge.
 */
export interface AuthUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  currency: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

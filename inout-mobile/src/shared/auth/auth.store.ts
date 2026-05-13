import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSecureZustandStorage, STORAGE_KEYS } from "@/shared/storage";
import type { AuthUser } from "./auth.types";

/**
 * Store de autenticacion.
 * - `user` se persiste con SecureStore (zustand persist)
 * - Los tokens se persisten en SecureStore directamente desde authApi (no aqui)
 *   para evitar duplicacion y mantenerlos fuera del JSON que serializa zustand.
 *
 * `hasHydrated` se expone via `useAuthStore.persist.hasHydrated()` (built-in).
 */

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: AuthUser) => void;
  patchUser: (patch: Partial<AuthUser>) => void;
  reset: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user, isAuthenticated: true }),
      patchUser: (patch) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...patch } } : state,
        ),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.authState,
      storage: createSecureZustandStorage(),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/** Hook util: indica si el rehidrato ya termino (evita flash de redirect). */
export function useAuthHydrated(): boolean {
  return useAuthStore.persist.hasHydrated();
}

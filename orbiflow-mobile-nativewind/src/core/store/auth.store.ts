import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserResponse } from "@/src/core/dto/auth.interface";
import { zustandStorage } from "./zustand-storage";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  setUser: (user: UserResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

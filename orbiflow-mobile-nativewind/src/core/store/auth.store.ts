import { create } from "zustand";
import { UserResponse } from "@/src/core/dto/auth.interface";

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setUser: (user: UserResponse) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  setHydrated: () => set({ isHydrated: true }),
}));

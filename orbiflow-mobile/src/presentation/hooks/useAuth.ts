import { useState } from 'react';
import { LoginUseCase } from '@domain/use-cases/auth/Login';
import { RegisterUseCase } from '@domain/use-cases/auth/Register';
import { LogoutUseCase } from '@domain/use-cases/auth/Logout';
import { AuthRepository } from '@data/repositories/AuthRepository';
import { useAuthStore } from '../store/authStore';

const authRepository = new AuthRepository();

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout: clearUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUseCase = new LoginUseCase(authRepository);
  const registerUseCase = new RegisterUseCase(authRepository);
  const logoutUseCase = new LogoutUseCase(authRepository);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await loginUseCase.execute(email, password);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await registerUseCase.execute(email, password, name);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUseCase.execute();
      clearUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };
};

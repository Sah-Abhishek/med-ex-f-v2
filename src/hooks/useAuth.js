import { useAuthStore } from '../store/authStore';

/**
 * Custom hook to access authentication state (backed by Zustand)
 */
export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  return { user, loading, error, isAuthenticated, login, logout };
};

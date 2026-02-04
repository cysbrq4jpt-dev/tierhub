import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { subscribeToAuthState } from '@/services/firebase/auth';

/**
 * Auth state を監視して Zustand store を更新するフック
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToAuthState((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
  };
};

import { useState } from 'react';
import { signOut } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLogout,
  };
};

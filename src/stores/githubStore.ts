import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface GitHubState {
  // State
  accessToken: string | null;
  user: GitHubUser | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccessToken: (token: string | null) => void;
  setUser: (user: GitHubUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set) => ({
      // Initial State
      accessToken: null,
      user: null,
      isConnected: false,
      isLoading: false,
      error: null,

      // Actions
      setAccessToken: (accessToken) =>
        set({
          accessToken,
          isConnected: !!accessToken,
          error: null,
        }),

      setUser: (user) =>
        set({
          user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      disconnect: () =>
        set({
          accessToken: null,
          user: null,
          isConnected: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'github-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);

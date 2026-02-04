import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, updateUserProfile } from '../services/userService';
import { useAuthStore } from '@/stores/authStore';

// ユーザー取得
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });
};

// プロフィール更新
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { user, updateProfile } = useAuthStore();

  return useMutation({
    mutationFn: (updates: {
      displayName?: string;
      bio?: string;
      photoURL?: string;
    }) => updateUserProfile(user!.id, updates),
    onSuccess: (_, variables) => {
      // キャッシュを更新
      queryClient.invalidateQueries({
        queryKey: ['user', user!.id],
      });
      // authStoreも更新
      updateProfile(variables);
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addLike,
  removeLike,
  checkLikeStatus,
  getUserLikes,
} from '../services/likeService';
import { useAuthStore } from '@/stores/authStore';

// いいね状態をチェック
export const useLikeStatus = (
  targetType: 'tierList' | 'comment',
  targetId: string
) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['likeStatus', targetType, targetId, user?.id],
    queryFn: () => checkLikeStatus(user!.id, targetType, targetId),
    enabled: !!user && !!targetId,
  });
};

// ユーザーのいいね一覧
export const useUserLikes = (targetType?: 'tierList' | 'comment') => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['userLikes', user?.id, targetType],
    queryFn: () => getUserLikes(user!.id, targetType),
    enabled: !!user,
  });
};

// いいねトグル
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      isLiked,
    }: {
      targetType: 'tierList' | 'comment';
      targetId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        await removeLike(user!.id, targetType, targetId);
      } else {
        await addLike(user!.id, targetType, targetId);
      }
    },
    onSuccess: (_, variables) => {
      // キャッシュを更新
      queryClient.invalidateQueries({
        queryKey: ['likeStatus', variables.targetType, variables.targetId, user!.id],
      });
      if (variables.targetType === 'tierList') {
        queryClient.invalidateQueries({
          queryKey: ['tierList', variables.targetId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ['comment', variables.targetId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['userLikes', user!.id],
      });
    },
  });
};

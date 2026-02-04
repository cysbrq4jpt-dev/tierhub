import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getFollowers,
  getFollowing,
  getFollowingUserIds,
} from '../services/userService';
import { useAuthStore } from '@/stores/authStore';

// フォロー状態をチェック
export const useFollowStatus = (followingId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['followStatus', user?.id, followingId],
    queryFn: () => checkFollowStatus(user!.id, followingId),
    enabled: !!user && !!followingId && user.id !== followingId,
  });
};

// フォロワー一覧
export const useFollowers = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['followers', userId],
    queryFn: ({ pageParam }) => getFollowers(userId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
    initialPageParam: undefined,
  });
};

// フォロー中一覧
export const useFollowing = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['following', userId],
    queryFn: ({ pageParam }) => getFollowing(userId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
    initialPageParam: undefined,
  });
};

// フォロー中のユーザーIDリスト
export const useFollowingUserIds = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['followingUserIds', user?.id],
    queryFn: () => getFollowingUserIds(user!.id),
    enabled: !!user,
  });
};

// フォロートグル
export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      followingId,
      isFollowing,
    }: {
      followingId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        await unfollowUser(user!.id, followingId);
      } else {
        await followUser(user!.id, followingId);
      }
    },
    onSuccess: (_, variables) => {
      // キャッシュを更新
      queryClient.invalidateQueries({
        queryKey: ['followStatus', user!.id, variables.followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ['followers', variables.followingId],
      });
      queryClient.invalidateQueries({
        queryKey: ['following', user!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['followingUserIds', user!.id],
      });
      // ユーザー情報も更新
      queryClient.invalidateQueries({
        queryKey: ['user', user!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['user', variables.followingId],
      });
    },
  });
};

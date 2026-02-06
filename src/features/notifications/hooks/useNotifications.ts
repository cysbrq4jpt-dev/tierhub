import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { useAuthStore } from '@/stores/authStore';

// 通知一覧取得
export const useNotifications = () => {
  const { user } = useAuthStore();

  return useInfiniteQuery({
    queryKey: ['notifications', user?.id],
    queryFn: ({ pageParam }) => getUserNotifications(user!.id, 20, pageParam),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastDoc : undefined),
    enabled: !!user,
    initialPageParam: undefined,
  });
};

// 未読通知数取得
export const useUnreadNotificationsCount = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['unreadNotificationsCount', user?.id],
    queryFn: () => getUnreadNotificationsCount(user!.id),
    enabled: !!user,
    refetchInterval: 60000, // 1分ごとに更新
  });
};

// 通知を既読にする
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['unreadNotificationsCount', user?.id],
      });
    },
  });
};

// すべての通知を既読にする
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['unreadNotificationsCount', user?.id],
      });
    },
  });
};

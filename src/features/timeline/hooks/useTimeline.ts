import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getTimeline,
  getPopularTierLists,
  getRecentTierLists,
  getPopularTierListsByCategory,
} from '../services/timelineService';
import { useFollowingUserIds } from '@/features/user/hooks/useFollow';

// タイムライン（フォロー中ユーザーのTIER表）
export const useTimeline = () => {
  const { data: followingUserIds } = useFollowingUserIds();

  return useInfiniteQuery({
    queryKey: ['timeline', followingUserIds],
    queryFn: ({ pageParam }) =>
      getTimeline(followingUserIds || [], 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!followingUserIds && followingUserIds.length > 0,
    initialPageParam: undefined,
  });
};

// 人気のTIER表
export const usePopularTierLists = () => {
  return useInfiniteQuery({
    queryKey: ['popularTierLists'],
    queryFn: ({ pageParam }) => getPopularTierLists(20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: undefined,
  });
};

// 新着のTIER表
export const useRecentTierLists = () => {
  return useInfiniteQuery({
    queryKey: ['recentTierLists'],
    queryFn: ({ pageParam }) => getRecentTierLists(20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: undefined,
  });
};

// カテゴリ別人気のTIER表
export const usePopularTierListsByCategory = (categoryId: string) => {
  return useInfiniteQuery({
    queryKey: ['popularTierListsByCategory', categoryId],
    queryFn: ({ pageParam }) =>
      getPopularTierListsByCategory(categoryId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!categoryId,
    initialPageParam: undefined,
  });
};

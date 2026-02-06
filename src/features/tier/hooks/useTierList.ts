import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getTierList,
  getUserTierLists,
  getTimelineTierLists,
  getCategoryTierLists,
  createTierList,
  updateTierList,
  deleteTierList,
  incrementViewCount,
  searchTierLists,
} from '../services/tierService';
import { CreateTierListInput, UpdateTierListInput } from '@/types/tier.types';
import { useAuthStore } from '@/stores/authStore';

// TIER表詳細取得
export const useTierList = (id: string) => {
  return useQuery({
    queryKey: ['tierList', id],
    queryFn: () => getTierList(id),
    enabled: !!id,
  });
};

// ユーザーのTIER表一覧
export const useUserTierLists = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['userTierLists', userId],
    queryFn: ({ pageParam }) => getUserTierLists(userId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!userId,
    initialPageParam: undefined,
  });
};

// タイムライン
export const useTimeline = (followingUserIds: string[]) => {
  return useInfiniteQuery({
    queryKey: ['timeline', followingUserIds],
    queryFn: ({ pageParam }) =>
      getTimelineTierLists(followingUserIds, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: followingUserIds.length > 0,
    initialPageParam: undefined,
  });
};

// カテゴリ別TIER表一覧
export const useCategoryTierLists = (categoryId: string) => {
  return useInfiniteQuery({
    queryKey: ['categoryTierLists', categoryId],
    queryFn: ({ pageParam }) =>
      getCategoryTierLists(categoryId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!categoryId,
    initialPageParam: undefined,
  });
};

// TIER表作成
export const useCreateTierList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (input: CreateTierListInput) =>
      createTierList(user!.id, input),
    onSuccess: (newTierList) => {
      // キャッシュを更新
      queryClient.invalidateQueries({
        queryKey: ['userTierLists', user!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['categoryTierLists', newTierList.categoryId],
      });
    },
  });
};

// TIER表更新
export const useUpdateTierList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateTierListInput;
    }) => updateTierList(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tierList', variables.id],
      });
    },
  });
};

// TIER表削除
export const useDeleteTierList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      id,
      categoryId,
    }: {
      id: string;
      categoryId: string;
    }) => deleteTierList(id, user!.id, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userTierLists', user!.id],
      });
    },
  });
};

// 閲覧数インクリメント
export const useIncrementViewCount = () => {
  return useMutation({
    mutationFn: (id: string) => incrementViewCount(id),
  });
};

// TIER表検索
export const useSearchTierLists = (
  searchQuery: string,
  categoryId?: string | null,
  sortBy: 'recent' | 'popular' | 'views' = 'popular'
) => {
  return useInfiniteQuery({
    queryKey: ['searchTierLists', searchQuery, categoryId, sortBy],
    queryFn: ({ pageParam }) =>
      searchTierLists(searchQuery, {
        categoryId,
        sortBy,
        pageSize: 20,
        lastDoc: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: undefined,
    enabled: searchQuery.trim().length > 0 || !!categoryId,
  });
};

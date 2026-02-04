import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  createComment,
  getComment,
  getTierListComments,
  updateComment,
  deleteComment,
} from '../services/commentService';
import { CreateCommentInput } from '../types/social.types';
import { useAuthStore } from '@/stores/authStore';

// コメント詳細取得
export const useComment = (id: string) => {
  return useQuery({
    queryKey: ['comment', id],
    queryFn: () => getComment(id),
    enabled: !!id,
  });
};

// TIER表のコメント一覧
export const useTierListComments = (tierListId: string) => {
  return useInfiniteQuery({
    queryKey: ['tierListComments', tierListId],
    queryFn: ({ pageParam }) => getTierListComments(tierListId, 20, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.lastDoc : undefined,
    enabled: !!tierListId,
    initialPageParam: undefined,
  });
};

// コメント作成
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      createComment(user!.id, input),
    onSuccess: (newComment) => {
      // キャッシュを更新
      queryClient.invalidateQueries({
        queryKey: ['tierListComments', newComment.tierListId],
      });
      queryClient.invalidateQueries({
        queryKey: ['tierList', newComment.tierListId],
      });
    },
  });
};

// コメント更新
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comment', variables.id],
      });
    },
  });
};

// コメント削除
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, tierListId }: { id: string; tierListId: string }) =>
      deleteComment(id, tierListId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tierListComments', variables.tierListId],
      });
      queryClient.invalidateQueries({
        queryKey: ['tierList', variables.tierListId],
      });
    },
  });
};

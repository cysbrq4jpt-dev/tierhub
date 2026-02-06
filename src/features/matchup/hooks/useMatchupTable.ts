import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  createMatchupTable,
  getMatchupTable,
  getUserMatchupTables,
  updateMatchupTable,
  deleteMatchupTable,
} from '../services/matchupService';
import {
  MatchupTable,
  CreateMatchupTableInput,
  UpdateMatchupTableInput,
} from '@/types/matchup.types';

// 相性表取得
export const useMatchupTable = (id: string) => {
  return useQuery({
    queryKey: ['matchupTable', id],
    queryFn: () => getMatchupTable(id),
    enabled: !!id,
  });
};

// ユーザーの相性表一覧
export const useUserMatchupTables = (userId: string) => {
  return useQuery({
    queryKey: ['userMatchupTables', userId],
    queryFn: () => getUserMatchupTables(userId),
    enabled: !!userId,
  });
};

// 相性表作成
export const useCreateMatchupTable = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (input: CreateMatchupTableInput) => {
      if (!user) throw new Error('ログインが必要です');
      return createMatchupTable(user.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatchupTables'] });
    },
  });
};

// 相性表更新
export const useUpdateMatchupTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMatchupTableInput }) =>
      updateMatchupTable(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matchupTable', variables.id] });
    },
  });
};

// 相性表削除
export const useDeleteMatchupTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMatchupTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMatchupTables'] });
    },
  });
};

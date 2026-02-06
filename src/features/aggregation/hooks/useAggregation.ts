import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  aggregateTierData,
  generateHeatmapData,
  saveItemExplanation,
  getTierListExplanations,
} from '../services/aggregationService';
import {
  AggregationFilter,
  AggregatedTierData,
  HeatmapData,
  ItemExplanation,
} from '@/types/aggregation.types';

// 集計データ取得
export const useAggregatedTierData = (
  categoryId: string,
  patchVersionId: string,
  filter?: AggregationFilter
) => {
  return useQuery({
    queryKey: ['aggregatedTierData', categoryId, patchVersionId, filter],
    queryFn: () => aggregateTierData(categoryId, patchVersionId, filter),
    enabled: !!categoryId && !!patchVersionId,
    staleTime: 5 * 60 * 1000, // 5分キャッシュ
  });
};

// ヒートマップデータ取得
export const useHeatmapData = (
  userTiers: Record<string, string>,
  aggregatedData: AggregatedTierData[]
) => {
  return generateHeatmapData(userTiers, aggregatedData);
};

// 解説メモ一覧取得
export const useTierListExplanations = (tierListId: string) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['explanations', tierListId, user?.id],
    queryFn: () => {
      if (!user) return [];
      return getTierListExplanations(tierListId, user.id);
    },
    enabled: !!tierListId && !!user,
  });
};

// 解説メモ保存
export const useSaveExplanation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: ({
      tierListId,
      itemId,
      explanation,
    }: {
      tierListId: string;
      itemId: string;
      explanation: string;
    }) => {
      if (!user) throw new Error('ログインが必要です');
      return saveItemExplanation(tierListId, itemId, user.id, explanation);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['explanations', variables.tierListId],
      });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTierListVersions,
  getVersionTimeline,
  saveTierListVersion,
  getCategoryPatchVersions,
  getLatestPatchVersion,
} from '../services/versionService';
import { TierListVersion, PatchVersion, VersionTimelineEntry } from '@/types/version.types';

// バージョンタイムライン取得
export const useVersionTimeline = (tierListId: string) => {
  return useQuery({
    queryKey: ['versionTimeline', tierListId],
    queryFn: () => getVersionTimeline(tierListId),
    enabled: !!tierListId,
  });
};

// Tier表のバージョン一覧
export const useTierListVersions = (tierListId: string) => {
  return useQuery({
    queryKey: ['tierListVersions', tierListId],
    queryFn: () => getTierListVersions(tierListId),
    enabled: !!tierListId,
  });
};

// パッチバージョン一覧
export const useCategoryPatchVersions = (categoryId: string) => {
  return useQuery({
    queryKey: ['patchVersions', categoryId],
    queryFn: () => getCategoryPatchVersions(categoryId),
    enabled: !!categoryId,
  });
};

// 最新パッチバージョン
export const useLatestPatchVersion = (categoryId: string) => {
  return useQuery({
    queryKey: ['latestPatchVersion', categoryId],
    queryFn: () => getLatestPatchVersion(categoryId),
    enabled: !!categoryId,
  });
};

// 新バージョン保存
export const useSaveTierListVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tierListId,
      patchVersionId,
      patchVersion,
      tiers,
      notes,
    }: {
      tierListId: string;
      patchVersionId: string;
      patchVersion: string;
      tiers: Record<string, string[]>;
      notes: string;
    }) => saveTierListVersion(tierListId, patchVersionId, patchVersion, tiers, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['versionTimeline', variables.tierListId],
      });
      queryClient.invalidateQueries({
        queryKey: ['tierListVersions', variables.tierListId],
      });
    },
  });
};

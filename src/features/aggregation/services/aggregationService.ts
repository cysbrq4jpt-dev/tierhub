import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  createDocument,
  getDocument,
  updateDocument,
  queryDocuments,
  PaginatedResult,
} from '@/services/firebase/firestore';
import {
  AggregatedTierData,
  AggregationFilter,
  AggregationSummary,
  HeatmapData,
  ItemExplanation,
  RankTier,
  TIER_NUMERIC_MAP,
  calculateDeviation,
  getHeatLevel,
} from '@/types/aggregation.types';
import { TierList, TIER_RANKS } from '@/types/tier.types';

const EXPLANATION_COLLECTION = 'itemExplanations';
const AGGREGATION_COLLECTION = 'aggregationCache';

// === 解説メモ機能 ===

// 解説メモ保存
export const saveItemExplanation = async (
  tierListId: string,
  itemId: string,
  userId: string,
  explanation: string
): Promise<ItemExplanation> => {
  // 既存の解説を確認
  const existing = await getItemExplanation(tierListId, itemId, userId);
  if (existing) {
    await updateDocument(EXPLANATION_COLLECTION, existing.id, { explanation });
    return { ...existing, explanation, updatedAt: new Date() };
  }

  return createDocument<ItemExplanation>(EXPLANATION_COLLECTION, {
    tierListId,
    itemId,
    userId,
    explanation,
  });
};

// 解説メモ取得
export const getItemExplanation = async (
  tierListId: string,
  itemId: string,
  userId: string
): Promise<ItemExplanation | null> => {
  const q = query(
    collection(db, EXPLANATION_COLLECTION),
    where('tierListId', '==', tierListId),
    where('itemId', '==', itemId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as ItemExplanation;
};

// Tier表の全解説メモ取得
export const getTierListExplanations = async (
  tierListId: string,
  userId: string
): Promise<ItemExplanation[]> => {
  const q = query(
    collection(db, EXPLANATION_COLLECTION),
    where('tierListId', '==', tierListId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ItemExplanation);
};

// === 集合知集計 ===

// カテゴリ×パッチの平均Tier評価を集計
export const aggregateTierData = async (
  categoryId: string,
  patchVersionId: string,
  filter?: AggregationFilter
): Promise<AggregatedTierData[]> => {
  // まずキャッシュを確認
  const cacheKey = `${categoryId}_${patchVersionId}_${JSON.stringify(filter || {})}`;
  const cached = await getDocument<AggregationSummary>(AGGREGATION_COLLECTION, cacheKey);
  if (cached && Date.now() - cached.generatedAt.getTime() < 3600000) {
    // 1時間以内のキャッシュがあればそれを返す
    return cached.items;
  }

  // 対象のTier表を取得
  const tierListsQuery = query(
    collection(db, 'tierLists'),
    where('categoryId', '==', categoryId),
    where('isPublic', '==', true)
  );
  const snapshot = await getDocs(tierListsQuery);
  const tierLists = snapshot.docs.map((doc) => doc.data() as TierList);

  // アイテムごとのTier配置を集計
  const itemStats = new Map<
    string,
    {
      tiers: string[];
      rankBreakdown: Record<RankTier, string[]>;
    }
  >();

  for (const tierList of tierLists) {
    for (const rank of TIER_RANKS) {
      const items = tierList.tiers[rank] || [];
      for (const item of items) {
        const itemId = item.masterItemId || item.id;
        if (!itemStats.has(itemId)) {
          itemStats.set(itemId, {
            tiers: [],
            rankBreakdown: { pro: [], advanced: [], general: [] },
          });
        }
        const stats = itemStats.get(itemId)!;
        stats.tiers.push(rank);
        // ランク帯の判別はユーザーのフォロワー数等に基づくが、
        // ここでは一般層として集計（実際にはユーザー情報とJOINが必要）
        stats.rankBreakdown.general.push(rank);
      }
    }
  }

  // 集計結果を生成
  const aggregated: AggregatedTierData[] = [];

  itemStats.forEach((stats, itemId) => {
    const tierValues = stats.tiers.map((t) => TIER_NUMERIC_MAP[t] || 3);
    const averageTier =
      tierValues.length > 0
        ? tierValues.reduce((sum, v) => sum + v, 0) / tierValues.length
        : 3;

    // Tier分布計算
    const distribution: Record<string, number> = {};
    for (const rank of TIER_RANKS) {
      const count = stats.tiers.filter((t) => t === rank).length;
      distribution[rank] = stats.tiers.length > 0
        ? Math.round((count / stats.tiers.length) * 100)
        : 0;
    }

    // ランク帯別
    const rankTierBreakdown: Record<RankTier, { averageTier: number; sampleCount: number }> =
      {} as any;
    for (const rankTier of ['pro', 'advanced', 'general'] as RankTier[]) {
      const values = stats.rankBreakdown[rankTier].map((t) => TIER_NUMERIC_MAP[t] || 3);
      rankTierBreakdown[rankTier] = {
        averageTier:
          values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 3,
        sampleCount: values.length,
      };
    }

    aggregated.push({
      categoryId,
      patchVersionId,
      itemId,
      itemName: '', // 呼び出し元でmasterItemsとJOINして名前を設定
      averageTier,
      tierDistribution: distribution,
      sampleCount: stats.tiers.length,
      rankTierBreakdown,
    });
  });

  return aggregated;
};

// ヒートマップデータ生成
export const generateHeatmapData = (
  userTiers: Record<string, string>, // itemId -> tier
  aggregatedData: AggregatedTierData[]
): HeatmapData[] => {
  return aggregatedData.map((item) => {
    const userTier = userTiers[item.itemId] || 'C';
    const deviationPercent = calculateDeviation(userTier, item.averageTier);
    const heatLevel = getHeatLevel(deviationPercent);

    return {
      itemId: item.itemId,
      userTier,
      communityAvgTier: item.averageTier,
      deviationPercent,
      heatLevel,
    };
  });
};

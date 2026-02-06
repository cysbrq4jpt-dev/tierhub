// 攻略データ集計（集合知）関連の型定義

export type RankTier = 'pro' | 'advanced' | 'general';

export const RANK_TIER_LABELS: Record<RankTier, string> = {
  pro: 'プロ',
  advanced: '上級者',
  general: '一般層',
};

// 全ユーザーの平均評価データ
export interface AggregatedTierData {
  categoryId: string;
  patchVersionId: string;
  itemId: string;
  itemName: string;
  averageTier: number; // S=6, A=5, B=4, C=3, D=2, F=1 の数値化
  tierDistribution: Record<string, number>; // { S: 45, A: 30, B: 15, ... } パーセンテージ
  sampleCount: number;
  rankTierBreakdown: Record<RankTier, { averageTier: number; sampleCount: number }>;
}

// ヒートマップ・オーバーレイ
export interface HeatmapData {
  itemId: string;
  userTier: string; // ユーザーの評価
  communityAvgTier: number; // コミュニティ平均
  deviationPercent: number; // ズレ度（%）
  heatLevel: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold'; // 視覚化レベル
}

export const HEAT_COLORS: Record<string, string> = {
  hot: '#FF1744', // 大きく高評価寄りのズレ
  warm: '#FF9100', // やや高評価寄り
  neutral: '#FFFFFF00', // ほぼ一致（透明）
  cool: '#448AFF', // やや低評価寄り
  cold: '#2962FF', // 大きく低評価寄りのズレ
};

// 解説メモ
export interface ItemExplanation {
  id: string;
  tierListId: string;
  itemId: string;
  userId: string;
  explanation: string; // 配置理由テキスト
  createdAt: Date;
  updatedAt: Date;
}

// フィルタ条件
export interface AggregationFilter {
  rankTier?: RankTier;
  minFollowers?: number;
  hasBadge?: boolean;
  patchVersionId?: string;
}

// 集計結果サマリー
export interface AggregationSummary {
  categoryId: string;
  patchVersionId: string;
  totalTierLists: number;
  totalUsers: number;
  filterApplied: AggregationFilter;
  items: AggregatedTierData[];
  generatedAt: Date;
}

// ズレ度計算ユーティリティ
export const TIER_NUMERIC_MAP: Record<string, number> = {
  S: 6,
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

export const NUMERIC_TIER_MAP: Record<number, string> = {
  6: 'S',
  5: 'A',
  4: 'B',
  3: 'C',
  2: 'D',
  1: 'F',
};

export const calculateDeviation = (userTier: string, communityAvg: number): number => {
  const userValue = TIER_NUMERIC_MAP[userTier] || 3;
  return Math.round(((userValue - communityAvg) / 6) * 100);
};

export const getHeatLevel = (deviationPercent: number): HeatmapData['heatLevel'] => {
  const abs = Math.abs(deviationPercent);
  if (abs > 30) return deviationPercent > 0 ? 'hot' : 'cold';
  if (abs > 15) return deviationPercent > 0 ? 'warm' : 'cool';
  return 'neutral';
};

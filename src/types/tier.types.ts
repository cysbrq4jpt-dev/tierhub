export const TIER_RANKS = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
export type TierRank = (typeof TIER_RANKS)[number];

export interface TierItem {
  id: string;
  tierListId?: string;
  masterItemId: string | null; // null = カスタムアイテム
  tier: TierRank | 'pool';
  order: number;
  customLabel: string | null;
  customImageUrl: string | null;
}

export interface TierData {
  [key: string]: TierItem[]; // S, A, B, C, D, F
}

export interface TierList {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  tiers: TierData;
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTierListInput {
  categoryId: string;
  title: string;
  description?: string;
  tiers: TierData;
  isPublic: boolean;
}

export interface UpdateTierListInput {
  title?: string;
  description?: string;
  tiers?: TierData;
  isPublic?: boolean;
}

// ドラッグ&ドロップ用
export interface DragItem {
  id: string;
  index: number;
  tier: TierRank | 'pool'; // 'pool' = 未分類エリア
}

export interface DropResult {
  itemId: string;
  fromTier: TierRank | 'pool';
  toTier: TierRank | 'pool';
  newIndex: number;
}

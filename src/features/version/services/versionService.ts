import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  createDocument,
  getDocument,
  queryDocuments,
  PaginatedResult,
} from '@/services/firebase/firestore';
import {
  PatchVersion,
  TierListVersion,
  TierDelta,
  VersionTimelineEntry,
} from '@/types/version.types';
import { TIER_RANKS } from '@/types/tier.types';

const PATCH_COLLECTION = 'patchVersions';
const VERSION_COLLECTION = 'tierListVersions';

// === パッチバージョン管理 ===

// パッチバージョン作成
export const createPatchVersion = async (
  input: Omit<PatchVersion, 'id' | 'createdAt'>
): Promise<PatchVersion> => {
  return createDocument<PatchVersion>(PATCH_COLLECTION, input);
};

// カテゴリのパッチバージョン一覧（新しい順）
export const getCategoryPatchVersions = async (
  categoryId: string,
  pageSize: number = 50
): Promise<PaginatedResult<PatchVersion>> => {
  return queryDocuments<PatchVersion>(
    PATCH_COLLECTION,
    [where('categoryId', '==', categoryId), orderBy('releaseDate', 'desc')],
    pageSize
  );
};

// パッチバージョン取得
export const getPatchVersion = async (id: string): Promise<PatchVersion | null> => {
  return getDocument<PatchVersion>(PATCH_COLLECTION, id);
};

// 最新パッチバージョン取得
export const getLatestPatchVersion = async (
  categoryId: string
): Promise<PatchVersion | null> => {
  const result = await queryDocuments<PatchVersion>(
    PATCH_COLLECTION,
    [where('categoryId', '==', categoryId), orderBy('releaseDate', 'desc')],
    1
  );
  return result.data[0] || null;
};

// === Tier表バージョン管理 ===

// 新しいバージョンを保存
export const saveTierListVersion = async (
  tierListId: string,
  patchVersionId: string,
  patchVersion: string,
  tiers: Record<string, string[]>,
  notes: string
): Promise<TierListVersion> => {
  // 既存バージョン数を取得して次の番号を決定
  const existingVersions = await getTierListVersions(tierListId);
  const versionNumber = existingVersions.data.length + 1;

  const data = {
    tierListId,
    patchVersionId,
    patchVersion,
    versionNumber,
    tiers,
    notes,
  };

  return createDocument<TierListVersion>(VERSION_COLLECTION, data);
};

// Tier表のバージョン一覧（タイムライン）
export const getTierListVersions = async (
  tierListId: string,
  pageSize: number = 100
): Promise<PaginatedResult<TierListVersion>> => {
  return queryDocuments<TierListVersion>(
    VERSION_COLLECTION,
    [where('tierListId', '==', tierListId), orderBy('versionNumber', 'desc')],
    pageSize
  );
};

// 特定バージョン取得
export const getTierListVersion = async (
  versionId: string
): Promise<TierListVersion | null> => {
  return getDocument<TierListVersion>(VERSION_COLLECTION, versionId);
};

// バージョンタイムライン生成
export const getVersionTimeline = async (
  tierListId: string
): Promise<VersionTimelineEntry[]> => {
  const result = await getTierListVersions(tierListId);

  return result.data.map((version, index) => {
    // 前のバージョンとの差分数を計算
    const prevVersion = result.data[index + 1]; // 降順なので+1が前バージョン
    let deltaCount = 0;

    if (prevVersion) {
      const deltas = calculateDeltas(prevVersion.tiers, version.tiers);
      deltaCount = deltas.length;
    }

    return {
      versionId: version.id,
      patchVersion: version.patchVersion,
      versionNumber: version.versionNumber,
      createdAt: version.createdAt,
      deltaCount,
    };
  });
};

// === デルタ計算 ===

// 2つのバージョン間の差分を計算
export const calculateDeltas = (
  previousTiers: Record<string, string[]>,
  currentTiers: Record<string, string[]>
): TierDelta[] => {
  const deltas: TierDelta[] = [];

  // 前バージョンのアイテムの位置をマップ化
  const prevPositions = new Map<string, string>();
  for (const tier of TIER_RANKS) {
    const items = previousTiers[tier] || [];
    items.forEach((itemId) => prevPositions.set(itemId, tier));
  }

  // 現バージョンのアイテムの位置をマップ化
  const currPositions = new Map<string, string>();
  for (const tier of TIER_RANKS) {
    const items = currentTiers[tier] || [];
    items.forEach((itemId) => currPositions.set(itemId, tier));
  }

  // Tier ランクの数値マップ（比較用）
  const tierOrder: Record<string, number> = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 };

  // 現バージョンの各アイテムをチェック
  currPositions.forEach((currentTier, itemId) => {
    const previousTier = prevPositions.get(itemId) || null;

    if (!previousTier) {
      deltas.push({ itemId, previousTier: null, currentTier, direction: 'new' });
    } else if (previousTier !== currentTier) {
      const prevRank = tierOrder[previousTier] || 0;
      const currRank = tierOrder[currentTier] || 0;
      deltas.push({
        itemId,
        previousTier,
        currentTier,
        direction: currRank > prevRank ? 'up' : 'down',
      });
    }
  });

  // 削除されたアイテムをチェック
  prevPositions.forEach((previousTier, itemId) => {
    if (!currPositions.has(itemId)) {
      deltas.push({ itemId, previousTier, currentTier: '', direction: 'removed' });
    }
  });

  return deltas;
};

// キャラのパッチ変更マーカーを取得
export const getCharacterChangeMarkers = (
  patchVersion: PatchVersion,
  characterId: string
): PatchVersion['notes'][number] | null => {
  return patchVersion.notes.find((note) => note.characterId === characterId) || null;
};

// バージョン・ライフサイクル管理 & パッチ追従の型定義

export interface PatchVersion {
  id: string;
  categoryId: string;
  version: string; // 例: "1.24", "Season 5 Patch 2"
  title: string;
  releaseDate: Date;
  notes: PatchNote[];
  sourceUrl: string; // 公式パッチノートURL
  createdAt: Date;
}

export interface PatchNote {
  characterId: string; // masterItemId
  characterName: string;
  changeType: 'buff' | 'nerf' | 'rework' | 'new' | 'bugfix';
  summary: string; // 変更内容の要約テキスト
  details: string[]; // 詳細な変更点リスト
}

export type ChangeMarker = 'buff' | 'nerf' | 'rework' | 'new' | 'none';

export const CHANGE_MARKER_ICONS: Record<ChangeMarker, string> = {
  buff: '↑',
  nerf: '↓',
  rework: '⟳',
  new: 'NEW',
  none: '',
};

export const CHANGE_MARKER_COLORS: Record<ChangeMarker, string> = {
  buff: '#4CAF50',
  nerf: '#F44336',
  rework: '#FF9800',
  new: '#2196F3',
  none: 'transparent',
};

// バージョン付きTier表スナップショット
export interface TierListVersion {
  id: string;
  tierListId: string;
  patchVersionId: string;
  patchVersion: string; // バージョン文字列（表示用）
  versionNumber: number; // 連番
  tiers: Record<string, string[]>; // { S: [itemId, ...], A: [...], ... }
  notes: string; // このバージョンの変更メモ
  createdAt: Date;
}

// デルタ（差分）情報
export interface TierDelta {
  itemId: string;
  previousTier: string | null; // 前バージョンでの位置（null = 新規追加）
  currentTier: string;
  direction: 'up' | 'down' | 'same' | 'new' | 'removed';
}

// タイムトラベル用
export interface VersionTimelineEntry {
  versionId: string;
  patchVersion: string;
  versionNumber: number;
  createdAt: Date;
  deltaCount: number; // 変更されたアイテム数
}

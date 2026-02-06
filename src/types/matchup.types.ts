// ダイナミック・マトリックス（相性表）関連の型定義

export interface MatchupCell {
  characterA: string; // masterItemId
  characterB: string; // masterItemId
  value: number; // 0〜10 (5が五分、0.5刻み) → 表示は「value : (10 - value)」
  memo: string;
}

export interface MatchupTable {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  patchVersion: string;
  characters: string[]; // masterItemId[] — 対象キャラの順序付きリスト
  cells: Record<string, MatchupCell>; // key = `${charA}_${charB}` (A < B の正規化順)
  isPublic: boolean;
  likesCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMatchupTableInput {
  categoryId: string;
  title: string;
  description?: string;
  patchVersion: string;
  characters: string[];
  cells: Record<string, MatchupCell>;
  isPublic: boolean;
}

export interface UpdateMatchupTableInput {
  title?: string;
  description?: string;
  cells?: Record<string, MatchupCell>;
  isPublic?: boolean;
}

// レーダーチャート用
export interface RadarDataPoint {
  characterId: string;
  characterName: string;
  value: number; // 有利度 0〜10
}

// セルのキー生成ユーティリティ
export const makeMatchupKey = (a: string, b: string): string => {
  return a < b ? `${a}_${b}` : `${b}_${a}`;
};

// A視点の値を取得（キー正規化を考慮）
export const getMatchupValue = (
  cells: Record<string, MatchupCell>,
  charA: string,
  charB: string
): number => {
  if (charA === charB) return 5; // 同キャラは五分
  const key = makeMatchupKey(charA, charB);
  const cell = cells[key];
  if (!cell) return 5;
  // A < B で格納されているので、A視点ならそのまま、B視点なら反転
  return charA < charB ? cell.value : 10 - cell.value;
};

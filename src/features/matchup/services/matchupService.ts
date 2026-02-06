import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
  PaginatedResult,
} from '@/services/firebase/firestore';
import {
  MatchupTable,
  CreateMatchupTableInput,
  UpdateMatchupTableInput,
} from '@/types/matchup.types';

const COLLECTION = 'matchupTables';

// 相性表作成
export const createMatchupTable = async (
  userId: string,
  input: CreateMatchupTableInput
): Promise<MatchupTable> => {
  const data = {
    userId,
    categoryId: input.categoryId,
    title: input.title,
    description: input.description || '',
    patchVersion: input.patchVersion,
    characters: input.characters,
    cells: input.cells,
    isPublic: input.isPublic,
    likesCount: 0,
    viewsCount: 0,
  };

  return createDocument<MatchupTable>(COLLECTION, data);
};

// 相性表取得
export const getMatchupTable = async (id: string): Promise<MatchupTable | null> => {
  return getDocument<MatchupTable>(COLLECTION, id);
};

// ユーザーの相性表一覧
export const getUserMatchupTables = async (
  userId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<MatchupTable>> => {
  return queryDocuments<MatchupTable>(
    COLLECTION,
    [where('userId', '==', userId), orderBy('createdAt', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// カテゴリ別相性表一覧
export const getCategoryMatchupTables = async (
  categoryId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<MatchupTable>> => {
  return queryDocuments<MatchupTable>(
    COLLECTION,
    [
      where('categoryId', '==', categoryId),
      where('isPublic', '==', true),
      orderBy('likesCount', 'desc'),
    ],
    pageSize,
    lastDoc as any
  );
};

// 相性表更新
export const updateMatchupTable = async (
  id: string,
  input: UpdateMatchupTableInput
): Promise<void> => {
  await updateDocument(COLLECTION, id, input);
};

// 相性表削除
export const deleteMatchupTable = async (id: string): Promise<void> => {
  await deleteDocument(COLLECTION, id);
};

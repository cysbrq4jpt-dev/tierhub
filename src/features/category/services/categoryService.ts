import { where } from 'firebase/firestore';
import {
  getDocument,
  queryDocuments,
  PaginatedResult,
} from '@/services/firebase/firestore';
import { Category, MasterItem } from '../types/category.types';

const CATEGORIES_COLLECTION = 'categories';
const MASTER_ITEMS_COLLECTION = 'masterItems';

// カテゴリ一覧取得（アクティブのみ）
export const getCategories = async (
  pageSize: number = 50
): Promise<PaginatedResult<Category>> => {
  return queryDocuments<Category>(
    CATEGORIES_COLLECTION,
    [where('isActive', '==', true)],
    pageSize
  );
};

// カテゴリ詳細取得
export const getCategory = async (id: string): Promise<Category | null> => {
  return getDocument<Category>(CATEGORIES_COLLECTION, id);
};

// カテゴリ内のMasterItem一覧取得
export const getCategoryItems = async (
  categoryId: string,
  pageSize: number = 50,
  lastDoc?: unknown
): Promise<PaginatedResult<MasterItem>> => {
  return queryDocuments<MasterItem>(
    MASTER_ITEMS_COLLECTION,
    [where('categoryId', '==', categoryId)],
    pageSize,
    lastDoc as any
  );
};

// MasterItem検索（名前で部分一致）
// Firestoreでは部分一致には startsWith のみ使用可能
export const searchMasterItems = async (
  query: string,
  categoryId?: string,
  pageSize: number = 20
): Promise<PaginatedResult<MasterItem>> => {
  const constraints: any[] = [];

  if (categoryId) {
    constraints.push(where('categoryId', '==', categoryId));
  }

  // Firestore の name フィールドで startsWith 検索
  // ※ 完全な部分一致検索には Cloud Functions やalgolia を推奨
  if (query.trim()) {
    constraints.push(where('name', '>=', query));
    constraints.push(where('name', '<', query + '\uffff'));
  }

  return queryDocuments<MasterItem>(
    MASTER_ITEMS_COLLECTION,
    constraints,
    pageSize
  );
};

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { queryDocuments, PaginatedResult } from '@/services/firebase/firestore';
import { TierList } from '@/types/tier.types';

// タイムライン取得（フォロー中ユーザーの公開TIER表）
export const getTimeline = async (
  followingUserIds: string[],
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  if (followingUserIds.length === 0) {
    return { data: [], lastDoc: null, hasMore: false };
  }

  // Firestoreの 'in' クエリは最大30要素まで
  const chunkedIds = followingUserIds.slice(0, 30);

  return queryDocuments<TierList>(
    'tierLists',
    [
      where('userId', 'in', chunkedIds),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ],
    pageSize,
    lastDoc as any
  );
};

// 人気のTIER表取得（いいね数順）
export const getPopularTierLists = async (
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  return queryDocuments<TierList>(
    'tierLists',
    [where('isPublic', '==', true), orderBy('likesCount', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// 新着のTIER表取得
export const getRecentTierLists = async (
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  return queryDocuments<TierList>(
    'tierLists',
    [where('isPublic', '==', true), orderBy('createdAt', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// カテゴリ別人気のTIER表
export const getPopularTierListsByCategory = async (
  categoryId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  return queryDocuments<TierList>(
    'tierLists',
    [
      where('categoryId', '==', categoryId),
      where('isPublic', '==', true),
      orderBy('likesCount', 'desc'),
    ],
    pageSize,
    lastDoc as any
  );
};

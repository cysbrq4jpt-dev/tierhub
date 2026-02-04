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
  incrementCounter,
  PaginatedResult,
} from '@/services/firebase/firestore';
import {
  TierList,
  TierItem,
  CreateTierListInput,
  UpdateTierListInput,
  TIER_RANKS,
} from '@/types/tier.types';

const COLLECTION = 'tierLists';
const ITEMS_COLLECTION = 'tierItems';

// TIER表作成
export const createTierList = async (
  userId: string,
  input: CreateTierListInput
): Promise<TierList> => {
  const batch = writeBatch(db);

  // TIER表ドキュメント作成
  const tierListRef = doc(collection(db, COLLECTION));
  const tierListData = {
    userId,
    categoryId: input.categoryId,
    title: input.title,
    description: input.description || '',
    isPublic: input.isPublic,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
  };

  batch.set(tierListRef, {
    ...tierListData,
    id: tierListRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // TIERアイテムを作成
  const allItems: TierItem[] = [];
  TIER_RANKS.forEach((rank) => {
    input.tiers[rank].forEach((item, index) => {
      const itemRef = doc(collection(db, ITEMS_COLLECTION));
      const itemData: TierItem = {
        ...item,
        id: itemRef.id,
        tierListId: tierListRef.id,
        tier: rank,
        order: index,
      };
      batch.set(itemRef, itemData);
      allItems.push(itemData);
    });
  });

  // ユーザーのTIER表数をインクリメント
  const userRef = doc(db, 'users', userId);
  batch.update(userRef, { tierListsCount: increment(1) });

  // カテゴリのTIER表数をインクリメント
  const categoryRef = doc(db, 'categories', input.categoryId);
  batch.update(categoryRef, { tierListsCount: increment(1) });

  await batch.commit();

  // 作成したTIER表を返す
  const tiers = TIER_RANKS.reduce((acc, rank) => {
    acc[rank] = allItems.filter((item) => item.tier === rank);
    return acc;
  }, {} as TierList['tiers']);

  return {
    ...tierListData,
    id: tierListRef.id,
    tiers,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// TIER表取得
export const getTierList = async (id: string): Promise<TierList | null> => {
  const tierList = await getDocument<Omit<TierList, 'tiers'>>(COLLECTION, id);
  if (!tierList) return null;

  // アイテムを取得
  const itemsQuery = query(
    collection(db, ITEMS_COLLECTION),
    where('tierListId', '==', id),
    orderBy('order')
  );
  const itemsSnapshot = await getDocs(itemsQuery);
  const items = itemsSnapshot.docs.map((doc) => doc.data() as TierItem);

  // TIERごとに整理
  const tiers = TIER_RANKS.reduce((acc, rank) => {
    acc[rank] = items.filter((item) => item.tier === rank);
    return acc;
  }, {} as TierList['tiers']);

  return { ...tierList, tiers };
};

// ユーザーのTIER表一覧取得
export const getUserTierLists = async (
  userId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  return queryDocuments<TierList>(
    COLLECTION,
    [where('userId', '==', userId), orderBy('createdAt', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// タイムライン取得（フォロー中ユーザーの公開TIER表）
export const getTimelineTierLists = async (
  followingUserIds: string[],
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  if (followingUserIds.length === 0) {
    return { data: [], lastDoc: null, hasMore: false };
  }

  // Firestoreの 'in' クエリは最大30要素
  const chunkedIds = followingUserIds.slice(0, 30);

  return queryDocuments<TierList>(
    COLLECTION,
    [
      where('userId', 'in', chunkedIds),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
    ],
    pageSize,
    lastDoc as any
  );
};

// カテゴリ別TIER表一覧取得
export const getCategoryTierLists = async (
  categoryId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<TierList>> => {
  return queryDocuments<TierList>(
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

// TIER表更新
export const updateTierList = async (
  id: string,
  input: UpdateTierListInput
): Promise<void> => {
  // 基本情報の更新
  const { tiers, ...basicInfo } = input;
  if (Object.keys(basicInfo).length > 0) {
    await updateDocument(COLLECTION, id, basicInfo);
  }

  // TIERアイテムの更新（必要な場合）
  if (tiers) {
    const batch = writeBatch(db);

    // 既存アイテムを削除
    const existingItemsQuery = query(
      collection(db, ITEMS_COLLECTION),
      where('tierListId', '==', id)
    );
    const existingItems = await getDocs(existingItemsQuery);
    existingItems.docs.forEach((doc) => batch.delete(doc.ref));

    // 新しいアイテムを作成
    TIER_RANKS.forEach((rank) => {
      tiers[rank].forEach((item, index) => {
        const itemRef = doc(collection(db, ITEMS_COLLECTION));
        batch.set(itemRef, {
          ...item,
          id: itemRef.id,
          tierListId: id,
          tier: rank,
          order: index,
        });
      });
    });

    await batch.commit();
  }
};

// TIER表削除
export const deleteTierList = async (
  id: string,
  userId: string,
  categoryId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // TIER表削除
  batch.delete(doc(db, COLLECTION, id));

  // アイテム削除
  const itemsQuery = query(
    collection(db, ITEMS_COLLECTION),
    where('tierListId', '==', id)
  );
  const items = await getDocs(itemsQuery);
  items.docs.forEach((doc) => batch.delete(doc.ref));

  // コメント削除
  const commentsQuery = query(
    collection(db, 'comments'),
    where('tierListId', '==', id)
  );
  const comments = await getDocs(commentsQuery);
  comments.docs.forEach((doc) => batch.delete(doc.ref));

  // いいね削除
  const likesQuery = query(
    collection(db, 'likes'),
    where('targetId', '==', id),
    where('targetType', '==', 'tierList')
  );
  const likes = await getDocs(likesQuery);
  likes.docs.forEach((doc) => batch.delete(doc.ref));

  // カウンター更新
  batch.update(doc(db, 'users', userId), { tierListsCount: increment(-1) });
  batch.update(doc(db, 'categories', categoryId), {
    tierListsCount: increment(-1),
  });

  await batch.commit();
};

// 閲覧数インクリメント
export const incrementViewCount = async (id: string): Promise<void> => {
  await incrementCounter(COLLECTION, id, 'viewsCount');
};

import {
  collection,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { getDocument, updateDocument, queryDocuments, PaginatedResult } from '@/services/firebase/firestore';
import { User } from '@/types/user.types';
import { Follow } from '@/features/social/types/social.types';

const USERS_COLLECTION = 'users';
const FOLLOWS_COLLECTION = 'follows';

// ユーザー取得
export const getUser = async (userId: string): Promise<User | null> => {
  return getDocument<User>(USERS_COLLECTION, userId);
};

// ユーザープロフィール更新
export const updateUserProfile = async (
  userId: string,
  updates: { displayName?: string; bio?: string; photoURL?: string }
): Promise<void> => {
  await updateDocument<User>(USERS_COLLECTION, userId, updates);
};

// フォロー
export const followUser = async (
  followerId: string,
  followingId: string
): Promise<Follow> => {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  const batch = writeBatch(db);

  // 既存のフォローをチェック
  const existingFollowQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  const existingFollows = await getDocs(existingFollowQuery);

  if (!existingFollows.empty) {
    throw new Error('Already following');
  }

  // フォロー作成
  const followRef = doc(collection(db, FOLLOWS_COLLECTION));
  const followData = {
    followerId,
    followingId,
  };

  batch.set(followRef, {
    ...followData,
    id: followRef.id,
    createdAt: new Date(),
  });

  // フォロワー数・フォロー数を更新
  const followerRef = doc(db, USERS_COLLECTION, followerId);
  batch.update(followerRef, { followingCount: increment(1) });

  const followingRef = doc(db, USERS_COLLECTION, followingId);
  batch.update(followingRef, { followersCount: increment(1) });

  await batch.commit();

  return {
    ...followData,
    id: followRef.id,
    createdAt: new Date(),
  };
};

// アンフォロー
export const unfollowUser = async (
  followerId: string,
  followingId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // フォローを検索
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  const followSnapshot = await getDocs(followQuery);

  if (followSnapshot.empty) {
    throw new Error('Follow not found');
  }

  // フォロー削除
  const followDoc = followSnapshot.docs[0];
  batch.delete(followDoc.ref);

  // フォロワー数・フォロー数を更新
  const followerRef = doc(db, USERS_COLLECTION, followerId);
  batch.update(followerRef, { followingCount: increment(-1) });

  const followingRef = doc(db, USERS_COLLECTION, followingId);
  batch.update(followingRef, { followersCount: increment(-1) });

  await batch.commit();
};

// フォロー状態をチェック
export const checkFollowStatus = async (
  followerId: string,
  followingId: string
): Promise<boolean> => {
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', followerId),
    where('followingId', '==', followingId)
  );
  const followSnapshot = await getDocs(followQuery);

  return !followSnapshot.empty;
};

// フォロワー一覧取得
export const getFollowers = async (
  userId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<Follow>> => {
  return queryDocuments<Follow>(
    FOLLOWS_COLLECTION,
    [where('followingId', '==', userId)],
    pageSize,
    lastDoc as any
  );
};

// フォロー中一覧取得
export const getFollowing = async (
  userId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<Follow>> => {
  return queryDocuments<Follow>(
    FOLLOWS_COLLECTION,
    [where('followerId', '==', userId)],
    pageSize,
    lastDoc as any
  );
};

// フォロー中のユーザーIDリストを取得
export const getFollowingUserIds = async (userId: string): Promise<string[]> => {
  const followQuery = query(
    collection(db, FOLLOWS_COLLECTION),
    where('followerId', '==', userId)
  );
  const followSnapshot = await getDocs(followQuery);

  return followSnapshot.docs.map((doc) => doc.data().followingId);
};

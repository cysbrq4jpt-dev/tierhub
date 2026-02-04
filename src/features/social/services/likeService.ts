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
import { createDocument, deleteDocument } from '@/services/firebase/firestore';
import { Like } from '../types/social.types';

const COLLECTION = 'likes';

// いいね追加
export const addLike = async (
  userId: string,
  targetType: 'tierList' | 'comment',
  targetId: string
): Promise<Like> => {
  const batch = writeBatch(db);

  // 既存のいいねをチェック
  const existingLikeQuery = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('targetType', '==', targetType),
    where('targetId', '==', targetId)
  );
  const existingLikes = await getDocs(existingLikeQuery);

  if (!existingLikes.empty) {
    throw new Error('Already liked');
  }

  // いいね作成
  const likeRef = doc(collection(db, COLLECTION));
  const likeData = {
    userId,
    targetType,
    targetId,
  };

  batch.set(likeRef, {
    ...likeData,
    id: likeRef.id,
    createdAt: new Date(),
  });

  // ターゲットのいいね数をインクリメント
  const targetCollection = targetType === 'tierList' ? 'tierLists' : 'comments';
  const targetRef = doc(db, targetCollection, targetId);
  batch.update(targetRef, { likesCount: increment(1) });

  await batch.commit();

  return {
    ...likeData,
    id: likeRef.id,
    createdAt: new Date(),
  };
};

// いいね削除
export const removeLike = async (
  userId: string,
  targetType: 'tierList' | 'comment',
  targetId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // いいねを検索
  const likeQuery = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('targetType', '==', targetType),
    where('targetId', '==', targetId)
  );
  const likeSnapshot = await getDocs(likeQuery);

  if (likeSnapshot.empty) {
    throw new Error('Like not found');
  }

  // いいね削除
  const likeDoc = likeSnapshot.docs[0];
  batch.delete(likeDoc.ref);

  // ターゲットのいいね数をデクリメント
  const targetCollection = targetType === 'tierList' ? 'tierLists' : 'comments';
  const targetRef = doc(db, targetCollection, targetId);
  batch.update(targetRef, { likesCount: increment(-1) });

  await batch.commit();
};

// いいね状態をチェック
export const checkLikeStatus = async (
  userId: string,
  targetType: 'tierList' | 'comment',
  targetId: string
): Promise<boolean> => {
  const likeQuery = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('targetType', '==', targetType),
    where('targetId', '==', targetId)
  );
  const likeSnapshot = await getDocs(likeQuery);

  return !likeSnapshot.empty;
};

// ユーザーのいいね一覧取得
export const getUserLikes = async (
  userId: string,
  targetType?: 'tierList' | 'comment'
): Promise<Like[]> => {
  const constraints = [where('userId', '==', userId)];

  if (targetType) {
    constraints.push(where('targetType', '==', targetType));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as Like);
};

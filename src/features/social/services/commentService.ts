import {
  collection,
  doc,
  query,
  where,
  orderBy,
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
import { Comment, CreateCommentInput } from '../types/social.types';

const COLLECTION = 'comments';

// コメント作成
export const createComment = async (
  userId: string,
  input: CreateCommentInput
): Promise<Comment> => {
  const batch = writeBatch(db);

  // コメント作成
  const commentRef = doc(collection(db, COLLECTION));
  const commentData = {
    userId,
    tierListId: input.tierListId,
    content: input.content,
    likesCount: 0,
  };

  batch.set(commentRef, {
    ...commentData,
    id: commentRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // TIER表のコメント数をインクリメント
  const tierListRef = doc(db, 'tierLists', input.tierListId);
  batch.update(tierListRef, { commentsCount: increment(1) });

  await batch.commit();

  return {
    ...commentData,
    id: commentRef.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// コメント取得
export const getComment = async (id: string): Promise<Comment | null> => {
  return getDocument<Comment>(COLLECTION, id);
};

// TIER表のコメント一覧取得
export const getTierListComments = async (
  tierListId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<Comment>> => {
  return queryDocuments<Comment>(
    COLLECTION,
    [where('tierListId', '==', tierListId), orderBy('createdAt', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// コメント更新
export const updateComment = async (
  id: string,
  content: string
): Promise<void> => {
  await updateDocument<Comment>(COLLECTION, id, { content });
};

// コメント削除
export const deleteComment = async (
  id: string,
  tierListId: string
): Promise<void> => {
  const batch = writeBatch(db);

  // コメント削除
  batch.delete(doc(db, COLLECTION, id));

  // TIER表のコメント数をデクリメント
  const tierListRef = doc(db, 'tierLists', tierListId);
  batch.update(tierListRef, { commentsCount: increment(-1) });

  // コメントへのいいねも削除
  const likesQuery = query(
    collection(db, 'likes'),
    where('targetId', '==', id),
    where('targetType', '==', 'comment')
  );

  await batch.commit();
};

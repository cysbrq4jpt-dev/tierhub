import { where, orderBy } from 'firebase/firestore';
import {
  createDocument,
  queryDocuments,
  updateDocument,
  PaginatedResult,
} from '@/services/firebase/firestore';
import { Notification, CreateNotificationInput } from '../types/notification.types';

const COLLECTION = 'notifications';

// 通知作成
export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification> => {
  // 自分自身への通知は作成しない
  if (input.userId === input.actorId) {
    throw new Error('Cannot create notification for self');
  }

  return createDocument<Notification>(COLLECTION, {
    ...input,
    isRead: false,
    createdAt: new Date(),
  });
};

// ユーザーの通知一覧取得
export const getUserNotifications = async (
  userId: string,
  pageSize: number = 20,
  lastDoc?: unknown
): Promise<PaginatedResult<Notification>> => {
  return queryDocuments<Notification>(
    COLLECTION,
    [where('userId', '==', userId), orderBy('createdAt', 'desc')],
    pageSize,
    lastDoc as any
  );
};

// 未読通知数を取得
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  const result = await queryDocuments<Notification>(
    COLLECTION,
    [where('userId', '==', userId), where('isRead', '==', false)],
    100 // 最大100件まで
  );
  return result.data.length;
};

// 通知を既読にする
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await updateDocument(COLLECTION, notificationId, { isRead: true });
};

// すべての通知を既読にする
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const notifications = await queryDocuments<Notification>(
    COLLECTION,
    [where('userId', '==', userId), where('isRead', '==', false)],
    100
  );

  // バッチ更新（簡易版）
  await Promise.all(
    notifications.data.map((notification) =>
      updateDocument(COLLECTION, notification.id, { isRead: true })
    )
  );
};

export type NotificationType = 'like' | 'comment' | 'follow';

export interface Notification {
  id: string;
  userId: string; // 通知を受け取るユーザー
  actorId: string; // アクションを実行したユーザー
  actorName: string;
  actorPhotoURL: string | null;
  type: NotificationType;
  targetId: string; // いいね/コメント対象のID
  targetType: 'tierList' | 'comment' | 'user';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  actorId: string;
  actorName: string;
  actorPhotoURL: string | null;
  type: NotificationType;
  targetId: string;
  targetType: 'tierList' | 'comment' | 'user';
  message: string;
}

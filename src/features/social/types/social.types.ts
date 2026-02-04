import { User } from '@/types/user.types';

export interface Comment {
  id: string;
  tierListId: string;
  userId: string;
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  // 結合データ
  user?: User;
  isLiked?: boolean;
}

export interface CreateCommentInput {
  tierListId: string;
  content: string;
}

export interface Like {
  id: string;
  targetType: 'tierList' | 'comment';
  targetId: string;
  userId: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

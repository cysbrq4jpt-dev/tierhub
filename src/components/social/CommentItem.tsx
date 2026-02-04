import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Comment } from '@/features/social/types/social.types';
import { Avatar } from '@/components/common/Avatar';
import { LikeButton } from './LikeButton';
import { useAuthStore } from '@/stores/authStore';

interface CommentItemProps {
  comment: Comment;
  onDelete?: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete }) => {
  const { user } = useAuthStore();
  const isOwner = comment.userId === user?.id;

  return (
    <View className="flex-row gap-3 px-4 py-3 border-b border-gray-800">
      {/* アバター */}
      <Avatar
        uri={comment.user?.photoURL}
        name={comment.user?.displayName}
        size={32}
      />

      {/* コメント本体 */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-sm font-semibold">
            {comment.user?.displayName || 'ユーザー'}
          </Text>
          <View className="flex-row items-center gap-3">
            <Text className="text-gray-500 text-xs">
              {formatRelativeTime(comment.createdAt)}
            </Text>
            {isOwner && onDelete && (
              <TouchableOpacity onPress={onDelete}>
                <Text className="text-gray-500 text-xs">削除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text className="text-gray-300 text-sm mt-1">{comment.content}</Text>

        {/* いいねボタン */}
        <View className="mt-2">
          <LikeButton
            targetType="comment"
            targetId={comment.id}
            likesCount={comment.likesCount || 0}
            compact
          />
        </View>
      </View>
    </View>
  );
};

function formatRelativeTime(date: Date | string | undefined): string {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 30) return `${diffDays}日前`;
  return `${Math.floor(diffDays / 30)}ヶ月前`;
}

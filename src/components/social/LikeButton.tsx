import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLikeStatus, useToggleLike } from '@/features/social/hooks/useLike';

interface LikeButtonProps {
  targetType: 'tierList' | 'comment';
  targetId: string;
  likesCount: number;
  compact?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  likesCount,
  compact = false,
}) => {
  const { data: isLiked } = useLikeStatus(targetType, targetId);
  const toggleLike = useToggleLike();

  const handlePress = () => {
    toggleLike.mutate({
      targetType,
      targetId,
      isLiked: !!isLiked,
    });
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center gap-1"
        activeOpacity={0.6}
      >
        <Text className={isLiked ? 'text-red-400' : 'text-gray-400'}>
          {isLiked ? '♥' : '♡'}
        </Text>
        <Text className={`text-sm ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
          {likesCount}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg ${
        isLiked ? 'bg-red-900' : 'bg-gray-800'
      }`}
      activeOpacity={0.6}
    >
      <Text className={`text-lg ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
        {isLiked ? '♥' : '♡'}
      </Text>
      <Text className={`text-sm ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
        {likesCount}
      </Text>
    </TouchableOpacity>
  );
};

import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFollowStatus, useToggleFollow } from '@/features/user/hooks/useFollow';
import { useAuthStore } from '@/stores/authStore';

interface FollowButtonProps {
  userId: string;
  compact?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ userId, compact = false }) => {
  const { user } = useAuthStore();
  const { data: isFollowing, isLoading: isCheckingStatus } = useFollowStatus(userId);
  const toggleFollow = useToggleFollow();

  // 自分自身の場合は非表示
  if (user?.id === userId) return null;

  const handlePress = () => {
    toggleFollow.mutate({
      followingId: userId,
      isFollowing: !!isFollowing,
    });
  };

  if (isCheckingStatus) {
    return <ActivityIndicator color="#2196F3" size="small" />;
  }

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        className={`px-3 py-1 rounded-full border ${
          isFollowing
            ? 'border-gray-600'
            : 'border-primary-500 bg-primary-500'
        }`}
        activeOpacity={0.7}
      >
        <Text className={`text-sm font-semibold ${isFollowing ? 'text-gray-400' : 'text-white'}`}>
          {isFollowing ? 'フォロー中' : 'フォロー'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`px-6 py-2 rounded-lg ${
        isFollowing ? 'bg-gray-800 border border-gray-600' : 'bg-primary-500'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-semibold ${isFollowing ? 'text-gray-300' : 'text-white'}`}>
        {isFollowing ? 'フォロー中' : 'フォロー'}
      </Text>
    </TouchableOpacity>
  );
};

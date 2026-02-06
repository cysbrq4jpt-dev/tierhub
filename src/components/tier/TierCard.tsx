import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { TierList, TIER_RANKS } from '@/types/tier.types';
import { Avatar } from '@/components/common/Avatar';

interface TierCardProps {
  tierList: TierList;
  showAuthor?: boolean;
  compact?: boolean;
}

export const TierCard: React.FC<TierCardProps> = ({
  tierList,
  showAuthor = false,
  compact = false,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/main/tier/${tierList.id}`);
  };

  const handleShare = async (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    try {
      await Share.share({
        message: `${tierList.title} - TierHub`,
      });
    } catch {
      // User cancelled
    }
  };

  // 各TIERの最初の2つのアイテムを表示用のミニプレビュー
  const renderMiniPreview = () => {
    return (
      <View className="flex-col gap-0.5 mt-2">
        {TIER_RANKS.slice(0, compact ? 3 : 6).map((rank) => {
          const items = tierList.tiers?.[rank] || [];
          if (items.length === 0 && compact) return null;
          return (
            <View key={rank} className="flex-row items-center h-6">
              <View
                className="w-6 h-6 justify-center items-center rounded-sm"
                style={{ backgroundColor: TIER_COLORS[rank] }}
              >
                <Text className="text-black text-xs font-bold">{rank}</Text>
              </View>
              <View className="flex-row ml-1 gap-0.5">
                {items.slice(0, 3).map((item, i) => (
                  <View
                    key={item.id || i}
                    className="w-6 h-6 bg-gray-700 rounded-sm justify-center items-center"
                  >
                    {item.customImageUrl ? (
                      <Image
                        source={{ uri: item.customImageUrl }}
                        className="w-full h-full rounded-sm"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-gray-400 text-xs leading-tight" numberOfLines={1}>
                        {(item.customLabel || '').substring(0, 2)}
                      </Text>
                    )}
                  </View>
                ))}
                {items.length > 3 && (
                  <Text className="text-gray-500 text-xs ml-0.5">+{items.length - 3}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-[#1E1E1E] rounded-xl p-3 mb-3 mx-4"
      activeOpacity={0.7}
    >
      {/* 著者情報バー */}
      {showAuthor && tierList.user && (
        <View className="flex-row items-center mb-2 gap-2">
          <Avatar uri={tierList.user.photoURL} name={tierList.user.displayName} size={28} />
          <Text className="text-white text-sm font-semibold">{tierList.user.displayName}</Text>
          <Text className="text-gray-500 text-xs ml-auto">
            {formatRelativeTime(tierList.createdAt)}
          </Text>
        </View>
      )}

      {/* タイトル・説明 */}
      <Text className="text-white text-base font-bold" numberOfLines={1}>
        {tierList.title}
      </Text>
      {tierList.description && !compact && (
        <Text className="text-gray-400 text-sm mt-0.5" numberOfLines={2}>
          {tierList.description}
        </Text>
      )}

      {/* ミニプレビュー */}
      {renderMiniPreview()}

      {/* 統計情報 */}
      <View className="flex-row mt-2 pt-2 border-t border-gray-700 gap-4 items-center">
        <Text className="text-gray-400 text-xs">♡ {tierList.likesCount || 0}</Text>
        <Text className="text-gray-400 text-xs">💬 {tierList.commentsCount || 0}</Text>
        <Text className="text-gray-400 text-xs">
          👁 {tierList.viewsCount || 0}
        </Text>
        <TouchableOpacity
          onPress={handleShare}
          className="ml-auto flex-row items-center gap-1"
          activeOpacity={0.6}
        >
          <Text className="text-gray-400 text-xs">↗ 共有</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const TIER_COLORS: Record<string, string> = {
  S: '#FF7F7F',
  A: '#FFBF7F',
  B: '#FFDF7F',
  C: '#FFFF7F',
  D: '#BFFF7F',
  F: '#7FBFFF',
};

// 相対時間表示
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

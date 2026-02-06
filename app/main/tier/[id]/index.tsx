import { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTierList, useIncrementViewCount } from '@/features/tier/hooks/useTierList';
import { useLikeStatus, useToggleLike } from '@/features/social/hooks/useLike';
import { TierBoard } from '@/components/tier/TierBoard';
import { useTierEditorStore } from '@/stores/tierStore';
import { Avatar } from '@/components/common/Avatar';
import { ShareButton } from '@/components/social/ShareButton';
import { TIER_RANKS, TierList } from '@/types/tier.types';
import { useEffect } from 'react';

export default function TierDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const tierBoardRef = useRef<View>(null);

  const { data: tierList, isLoading } = useTierList(id);
  const { data: isLiked } = useLikeStatus('tierList', id);
  const toggleLike = useToggleLike();
  const incrementViewCount = useIncrementViewCount();

  // 閲覧時にviewCountをインクリメント
  useEffect(() => {
    if (id) {
      incrementViewCount.mutate(id);
    }
  }, [id]);

  const isOwner = tierList?.userId === user?.id;

  const handleLike = () => {
    toggleLike.mutate({
      targetType: 'tierList',
      targetId: id,
      isLiked: !!isLiked,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <ActivityIndicator color="#2196F3" size="large" />
      </View>
    );
  }

  if (!tierList) {
    return (
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <Text className="text-gray-500">TIER表が見つかりません</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-500">← 戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white flex-1 mx-3" numberOfLines={1}>
          {tierList.title}
        </Text>
        <View className="flex-row gap-3">
          {isOwner && (
            <TouchableOpacity onPress={() => router.push(`/main/tier/${id}/edit`)}>
              <Text className="text-primary-500 text-base">編集</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* 著者情報 */}
        {tierList.user ? (
          <View className="flex-row items-center p-4 gap-3">
            <Avatar uri={tierList.user.photoURL} name={tierList.user.displayName} size={40} />
            <View className="flex-1">
              <Text className="text-white font-semibold">{tierList.user.displayName}</Text>
              <Text className="text-gray-500 text-sm">
                {formatRelativeTime(tierList.createdAt)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="p-4">
            <Text className="text-gray-500 text-sm">
              {formatRelativeTime(tierList.createdAt)}
            </Text>
          </View>
        )}

        {/* 説明 */}
        {tierList.description && (
          <View className="px-4 mb-2">
            <Text className="text-gray-400 text-sm">{tierList.description}</Text>
          </View>
        )}

        {/* TIER表（読み取り専用 + 画像キャプチャ用ref） */}
        <View ref={tierBoardRef} collapsable={false} className="px-2" style={{ minHeight: 400 }}>
          <TierBoardStatic tierList={tierList} />
        </View>

        {/* アクションバー */}
        <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-800 mt-2">
          <TouchableOpacity
            onPress={handleLike}
            className={`flex-row items-center gap-1 px-4 py-2 rounded-lg ${
              isLiked ? 'bg-red-900' : 'bg-gray-800'
            }`}
          >
            <Text className={`text-lg ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
              {isLiked ? '♥' : '♡'}
            </Text>
            <Text className={`text-sm ${isLiked ? 'text-red-400' : 'text-gray-400'}`}>
              {tierList.likesCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/main/tier/${id}/comments`)}
            className="flex-row items-center gap-1 px-4 py-2 rounded-lg bg-gray-800"
          >
            <Text className="text-gray-400 text-lg">💬</Text>
            <Text className="text-gray-400 text-sm">{tierList.commentsCount || 0}</Text>
          </TouchableOpacity>

          <Text className="text-gray-500 text-sm">👁 {tierList.viewsCount || 0}</Text>

          <ShareButton
            title={tierList.title}
            viewRef={tierBoardRef}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// 読み取り専用の静的TIERボード
function TierBoardStatic({ tierList }: { tierList: TierList }) {
  const TIER_COLORS: Record<string, string> = {
    S: '#FF7F7F',
    A: '#FFBF7F',
    B: '#FFDF7F',
    C: '#FFFF7F',
    D: '#BFFF7F',
    F: '#7FBFFF',
  };

  return (
    <View>
      {TIER_RANKS.map((rank) => {
        const items = tierList.tiers?.[rank] || [];
        return (
          <View key={rank} className="flex-row h-20 mb-1">
            <View
              className="w-15 justify-center items-center rounded"
              style={{ backgroundColor: TIER_COLORS[rank] }}
            >
              <Text className="text-2xl font-bold text-black">{rank}</Text>
            </View>
            <View className="flex-1 ml-1 bg-[#1E1E1E] rounded px-1 flex-row items-center">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row items-center">
                  {items.map((item, i) => (
                    <View
                      key={item.id || i}
                      className="w-16 h-16 m-1 rounded overflow-hidden bg-gray-700 justify-center items-center p-1"
                    >
                      {item.customImageUrl ? (
                        <View className="w-full h-full">
                          <Text className="text-xs text-gray-400 text-center" numberOfLines={2}>
                            {item.customLabel || 'アイテム'}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-xs text-gray-400 text-center" numberOfLines={2}>
                          {item.customLabel || 'アイテム'}
                        </Text>
                      )}
                    </View>
                  ))}
                  {items.length === 0 && (
                    <Text className="text-gray-700 text-xs px-2">なし</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        );
      })}
    </View>
  );
}

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

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@/features/user/hooks/useUser';
import { useUserTierLists } from '@/features/tier/hooks/useTierList';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/social/FollowButton';
import { TierCard } from '@/components/tier/TierCard';
import { TierList } from '@/types/tier.types';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { data: user, isLoading: isUserLoading } = useUser(id);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserTierLists(id);

  const tierLists: TierList[] = data?.pages.flatMap((page) => page.data) || [];
  const isOwnProfile = currentUser?.id === id;

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-8">
      <Text className="text-gray-500 text-sm">まだTIER表がありません</Text>
    </View>
  );

  const renderHeader = () => {
    if (!user) return null;

    return (
      <View>
        {/* プロフィール情報 */}
        <View className="items-center px-4 py-6">
          <Avatar uri={user.photoURL} name={user.displayName} size={80} />
          <Text className="text-white text-xl font-bold mt-3">{user.displayName}</Text>
          {user.bio ? (
            <Text className="text-gray-400 text-sm mt-1 text-center">{user.bio}</Text>
          ) : (
            <Text className="text-gray-600 text-sm mt-1">bio を設定していません</Text>
          )}

          {/* フォローボタン */}
          {!isOwnProfile && (
            <View className="mt-3">
              <FollowButton userId={id} />
            </View>
          )}

          {/* 統計情報 */}
          <View className="flex-row mt-4 gap-8">
            <TouchableOpacity
              className="items-center"
              onPress={() => router.push(`/main/user/${id}/followers`)}
            >
              <Text className="text-white text-lg font-bold">{user.followersCount || 0}</Text>
              <Text className="text-gray-500 text-xs">フォロワー</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center"
              onPress={() => router.push(`/main/user/${id}/following`)}
            >
              <Text className="text-white text-lg font-bold">{user.followingCount || 0}</Text>
              <Text className="text-gray-500 text-xs">フォロー中</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-white text-lg font-bold">{user.tierListsCount || 0}</Text>
              <Text className="text-gray-500 text-xs">TIER表</Text>
            </View>
          </View>
        </View>

        {/* セパレータ & TIER表一覧ラベル */}
        <View className="border-t border-gray-800 px-4 py-2">
          <Text className="text-gray-500 text-sm font-semibold">TIER表一覧</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">
          {user?.displayName || 'ユーザー'}
        </Text>
      </View>

      {isUserLoading || isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={tierLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TierCard tierList={item} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          className="flex-1"
        />
      )}
    </View>
  );
}

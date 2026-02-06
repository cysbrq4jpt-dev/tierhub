import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUserTierLists } from '@/features/tier/hooks/useTierList';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { TierCard } from '@/components/tier/TierCard';
import { Avatar } from '@/components/common/Avatar';
import { TierList } from '@/types/tier.types';

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserTierLists(user?.id || '');

  const tierLists: TierList[] = data?.pages.flatMap((page) => page.data) || [];

  // 未認証の場合はログインプロンプト
  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-[#121212]">
        <View className="p-4 border-b border-gray-800">
          <Text className="text-2xl font-bold text-white">Profile</Text>
        </View>
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-gray-700 rounded-full justify-center items-center mb-4">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-white text-xl font-bold">ゲストユーザー</Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            ログインしてTIER表を作成・共有しましょう
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/auth/login')}
            className="bg-primary-500 px-8 py-3 rounded-lg mt-6"
          >
            <Text className="text-white text-center font-semibold">ログイン</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

  // プロフィールヘッダを ListHeaderComponent として使用
  const renderHeader = () => (
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

        {/* 編集ボタン */}
        <TouchableOpacity
          onPress={() => router.push('/main/profile/edit')}
          className="mt-3 bg-[#1E1E1E] px-6 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-semibold">プロフィールを編集</Text>
        </TouchableOpacity>

        {/* 統計情報 */}
        <View className="flex-row mt-4 gap-8">
          <View className="items-center">
            <Text className="text-white text-lg font-bold">{user.tierListsCount || 0}</Text>
            <Text className="text-gray-500 text-xs">TIER表</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-lg font-bold">{user.followersCount || 0}</Text>
            <Text className="text-gray-500 text-xs">フォロワー</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-lg font-bold">{user.followingCount || 0}</Text>
            <Text className="text-gray-500 text-xs">フォロー</Text>
          </View>
        </View>
      </View>

      {/* セパレータ & TIER表一覧ラベル */}
      <View className="border-t border-gray-800 px-4 py-2">
        <Text className="text-gray-500 text-sm font-semibold">TIER表一覧</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">Profile</Text>
        <TouchableOpacity onPress={() => router.push('/main/settings')}>
          <Text className="text-2xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
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

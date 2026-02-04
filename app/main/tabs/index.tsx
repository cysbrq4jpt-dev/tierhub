import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useUserTierLists } from '@/features/tier/hooks/useTierList';
import { TierCard } from '@/components/tier/TierCard';
import { TierList } from '@/types/tier.types';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserTierLists(user?.id || '');

  // ページネーション結果をフラットなリストにまとめる
  const tierLists: TierList[] =
    data?.pages.flatMap((page) => page.data) || [];

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center mt-32">
      <Text className="text-gray-500 text-lg">TIER表はまだありません</Text>
      <Text className="text-gray-600 text-sm mt-2 text-center px-8">
        右下の＋ボタンから最初のTIER表を作成してみましょう
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">My Tier Lists</Text>
        <Text className="text-sm text-gray-500 mt-1">あなたのTIER表一覧</Text>
      </View>

      {/* ローディング */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={tierLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TierCard tierList={item} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          className="flex-1"
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/main/tier/create')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full justify-center items-center"
        style={{
          shadowColor: '#2196F3',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}

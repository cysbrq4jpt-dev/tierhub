import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCategory } from '@/features/category/hooks/useCategories';
import { useCategoryTierLists } from '@/features/tier/hooks/useTierList';
import { TierCard } from '@/components/tier/TierCard';
import { TierList } from '@/types/tier.types';

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: category, isLoading: isCategoryLoading } = useCategory(id);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCategoryTierLists(id);

  const tierLists: TierList[] = data?.pages.flatMap((page) => page.data) || [];

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderHeader = () => (
    <View className="px-4 py-4 bg-[#1A1A1A]">
      <Text className="text-white text-xl font-bold">
        {category?.name || 'カテゴリ'}
      </Text>
      {category?.description && (
        <Text className="text-gray-400 text-sm mt-1">{category.description}</Text>
      )}
      <Text className="text-gray-500 text-sm mt-2">
        {category?.tierListsCount || 0} 件のTIER表
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View className="items-center py-12">
      <Text className="text-gray-500 text-base">このカテゴリにTIER表がありません</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4" numberOfLines={1}>
          {category?.name || 'カテゴリ'}
        </Text>
      </View>

      {isCategoryLoading || isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={tierLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TierCard tierList={item} showAuthor />}
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

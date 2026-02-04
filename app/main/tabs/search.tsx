import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useCategories } from '@/features/category/hooks/useCategories';
import { usePopularTierLists, useRecentTierLists } from '@/features/timeline/hooks/useTimeline';
import { useCategoryTierLists } from '@/features/tier/hooks/useTierList';
import { TierCard } from '@/components/tier/TierCard';
import { Category } from '@/features/category/types/category.types';
import { TierList } from '@/types/tier.types';

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesResult, isLoading: isCategoriesLoading } = useCategories();
  const popular = usePopularTierLists();
  const categoryTierLists = useCategoryTierLists(selectedCategory || '');

  const categories: Category[] = categoriesResult?.data || [];

  // 表示するTIER表リスト
  const tierLists: TierList[] = selectedCategory
    ? (categoryTierLists?.data?.pages.flatMap((page) => page.data) || [])
    : (popular?.data?.pages.flatMap((page) => page.data) || []);

  const isLoading = selectedCategory ? categoryTierLists?.isLoading : popular?.isLoading;
  const fetchNextPage = selectedCategory ? categoryTierLists?.fetchNextPage : popular?.fetchNextPage;
  const hasNextPage = selectedCategory ? categoryTierLists?.hasNextPage : popular?.hasNextPage;
  const isFetchingNextPage = selectedCategory
    ? categoryTierLists?.isFetchingNextPage
    : popular?.isFetchingNextPage;

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-12">
      <Text className="text-gray-500 text-base">
        {selectedCategory ? 'このカテゴリにTIER表がありません' : 'TIER表がありません'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* カテゴリフィルター */}
      {!isCategoriesLoading && categories.length > 0 && (
        <View className="px-4 py-3">
          <Text className="text-gray-500 text-xs font-semibold mb-2">カテゴリ</Text>
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full border ${
                !selectedCategory
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-600'
              }`}
            >
              <Text className={`text-sm ${!selectedCategory ? 'text-white' : 'text-gray-400'}`}>
                全て
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full border ${
                  selectedCategory === cat.id
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-600'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === cat.id ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* セクションラベル */}
      <View className="px-4 py-2 border-b border-gray-800">
        <Text className="text-gray-500 text-sm font-semibold">
          {selectedCategory ? 'カテゴリ別' : '人気'} TIER表
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* 検索バー */}
      <View className="p-4 border-b border-gray-800">
        <View className="flex-row items-center bg-[#1E1E1E] rounded-lg px-3 py-2 gap-2">
          <Text className="text-gray-500">🔍</Text>
          <TextInput
            className="flex-1 text-white text-sm"
            placeholder="TIER表やカテゴリを検索"
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-500">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* リスト */}
      {isLoading ? (
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
          onEndReached={() => hasNextPage && fetchNextPage?.()}
          onEndReachedThreshold={0.5}
          className="flex-1"
          key={selectedCategory || 'all'}
        />
      )}
    </View>
  );
}

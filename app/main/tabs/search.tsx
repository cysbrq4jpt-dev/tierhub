import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useCategories } from '@/features/category/hooks/useCategories';
import { usePopularTierLists } from '@/features/timeline/hooks/useTimeline';
import { useSearchTierLists } from '@/features/tier/hooks/useTierList';
import { TierCard } from '@/components/tier/TierCard';
import { Category } from '@/features/category/types/category.types';
import { TierList } from '@/types/tier.types';

type SortOption = 'popular' | 'recent' | 'views';

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const { data: categoriesResult, isLoading: isCategoriesLoading } = useCategories();
  const categories: Category[] = categoriesResult?.data || [];

  // 検索クエリまたはフィルターが有効な場合は検索を実行
  const shouldSearch = searchQuery.trim().length > 0 || selectedCategory !== null;

  // 検索結果
  const searchResults = useSearchTierLists(
    searchQuery,
    selectedCategory,
    sortBy
  );

  // デフォルト（人気のTIER表）
  const popularTierLists = usePopularTierLists();

  // 表示するデータソースを決定
  const activeQuery = shouldSearch ? searchResults : popularTierLists;

  const tierLists: TierList[] = useMemo(
    () => activeQuery?.data?.pages.flatMap((page) => page.data) || [],
    [activeQuery?.data]
  );

  const isLoading = activeQuery?.isLoading || false;
  const fetchNextPage = activeQuery?.fetchNextPage;
  const hasNextPage = activeQuery?.hasNextPage || false;
  const isFetchingNextPage = activeQuery?.isFetchingNextPage || false;

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
        {shouldSearch
          ? '検索結果が見つかりませんでした'
          : 'TIER表がありません'}
      </Text>
      {shouldSearch && (
        <Text className="text-gray-600 text-sm mt-2">
          別のキーワードやフィルターをお試しください
        </Text>
      )}
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* カテゴリフィルター */}
      {!isCategoriesLoading && categories.length > 0 && (
        <View className="px-4 py-3 border-b border-gray-800">
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

      {/* ソートオプション */}
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-gray-500 text-xs font-semibold mb-2">並び替え</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-full border ${
              sortBy === 'popular'
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-600'
            }`}
          >
            <Text className={`text-sm ${sortBy === 'popular' ? 'text-white' : 'text-gray-400'}`}>
              👍 人気順
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('recent')}
            className={`px-3 py-1 rounded-full border ${
              sortBy === 'recent'
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-600'
            }`}
          >
            <Text className={`text-sm ${sortBy === 'recent' ? 'text-white' : 'text-gray-400'}`}>
              🕒 新着順
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSortBy('views')}
            className={`px-3 py-1 rounded-full border ${
              sortBy === 'views'
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-600'
            }`}
          >
            <Text className={`text-sm ${sortBy === 'views' ? 'text-white' : 'text-gray-400'}`}>
              👁️ 閲覧順
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 結果ヘッダー */}
      {shouldSearch && (
        <View className="px-4 py-2 bg-[#1A1A1A]">
          <Text className="text-gray-400 text-sm">
            {tierLists.length > 0
              ? `${tierLists.length}件の検索結果`
              : '検索結果はありません'}
          </Text>
        </View>
      )}
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
            placeholder="TIER表を検索"
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
          key={`${selectedCategory || 'all'}_${sortBy}_${searchQuery}`}
        />
      )}
    </View>
  );
}

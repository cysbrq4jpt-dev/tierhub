import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCategories } from '@/features/category/hooks/useCategories';
import { Category } from '@/features/category/types/category.types';

const CATEGORY_ICONS: Record<string, string> = {
  general: '📊',
  games: '🎮',
  anime: '🎌',
  movies: '🎬',
  music: '🎵',
  food: '🍽️',
  sports: '⚽',
  travel: '✈️',
};

export default function CategoryList() {
  const router = useRouter();
  const { data: categoriesResult, isLoading } = useCategories();
  const categories: Category[] = categoriesResult?.data || [];

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      onPress={() => router.push(`/main/category/${item.id}`)}
      className="mx-4 my-2 bg-[#1E1E1E] rounded-xl p-4 flex-row items-center gap-3"
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-[#2A2A2A] rounded-lg justify-center items-center">
        <Text className="text-2xl">{CATEGORY_ICONS[item.id] || '📂'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-500 text-sm">{item.description}</Text>
      </View>
      <View className="items-end">
        <Text className="text-gray-500 text-xs">{item.tierListsCount || 0}</Text>
        <Text className="text-gray-600 text-xs">TIER表</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">カテゴリ</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">カテゴリがありません</Text>
        </View>
      )}
    </View>
  );
}

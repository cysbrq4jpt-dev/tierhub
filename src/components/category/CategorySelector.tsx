import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
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
  books: '📚',
  tech: '💻',
};

interface CategorySelectorProps {
  visible: boolean;
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}

export function CategorySelector({
  visible,
  selectedCategoryId,
  onSelect,
  onClose,
}: CategorySelectorProps) {
  const { data: categoriesResult, isLoading } = useCategories();
  const categories: Category[] = categoriesResult?.data || [];

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
  };

  const renderItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedCategoryId;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.id)}
        className={`mx-4 my-1 p-4 rounded-lg flex-row items-center gap-3 ${
          isSelected ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-[#1E1E1E]'
        }`}
        activeOpacity={0.7}
      >
        <View className="w-10 h-10 bg-[#2A2A2A] rounded-lg justify-center items-center">
          <Text className="text-xl">{CATEGORY_ICONS[item.id] || '📂'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold">{item.name}</Text>
          <Text className="text-gray-500 text-xs" numberOfLines={1}>
            {item.description}
          </Text>
        </View>
        {isSelected && <Text className="text-primary-500 text-xl">✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-[#121212] rounded-t-3xl max-h-[70%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
            <Text className="text-white text-lg font-bold">カテゴリーを選択</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-primary-500 text-base">閉じる</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator color="#2196F3" size="large" />
            </View>
          ) : categories.length > 0 ? (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          ) : (
            <View className="py-12 items-center">
              <Text className="text-gray-500">カテゴリーがありません</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

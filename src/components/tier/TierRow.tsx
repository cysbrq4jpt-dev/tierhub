import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { TierItem as TierItemComponent } from './TierItem';
import { TierItem, TierRank } from '@/types/tier.types';

interface TierRowProps {
  rank: TierRank;
  items: TierItem[];
  editable?: boolean;
  selectedItemId?: string | null;
  isDropTarget?: boolean;
  onItemLongPress?: (item: TierItem) => void;
  onItemPress?: (item: TierItem) => void;
  onTierLabelTap?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

const TIER_COLORS: Record<TierRank, string> = {
  S: 'bg-[#FF7F7F]',
  A: 'bg-[#FFBF7F]',
  B: 'bg-[#FFDF7F]',
  C: 'bg-[#FFFF7F]',
  D: 'bg-[#BFFF7F]',
  F: 'bg-[#7FBFFF]',
};

export const TierRow: React.FC<TierRowProps> = ({
  rank,
  items,
  editable,
  selectedItemId,
  isDropTarget = false,
  onItemLongPress,
  onItemPress,
  onTierLabelTap,
  onReorder,
}) => {
  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<TierItem>) => (
      <ScaleDecorator>
        <TierItemComponent
          item={item}
          isActive={isActive}
          isSelected={selectedItemId === item.id}
          onPress={() => onItemPress?.(item)}
          onLongPress={editable ? drag : undefined}
        />
      </ScaleDecorator>
    ),
    [editable, selectedItemId, onItemPress]
  );

  // 長押し直接のハンドラ（DraggableFlatListのdragが発火しない場合のフォールバック）
  const handleItemLongPressWrapper = useCallback((item: TierItem) => {
    onItemLongPress?.(item);
  }, [onItemLongPress]);

  return (
    <View className="flex-row h-20 mb-1">
      {/* TIERラベル - 選択中アイテムがある場合はタップで移動先設定 */}
      <TouchableOpacity
        onPress={onTierLabelTap}
        className={`w-15 justify-center items-center rounded ${TIER_COLORS[rank]} ${
          isDropTarget ? 'opacity-100 scale-105 border-2 border-white' : ''
        }`}
        activeOpacity={isDropTarget ? 0.6 : 1.0}
      >
        <Text className="text-2xl font-bold text-black">{rank}</Text>
        {isDropTarget && (
          <Text className="text-black text-xs font-bold mt-0.5">→ ここへ</Text>
        )}
      </TouchableOpacity>

      {/* アイテムリスト */}
      <View
        className={`flex-1 ml-1 rounded px-1 ${
          isDropTarget ? 'bg-[#2A3A2A] border border-green-500' : 'bg-[#1E1E1E]'
        }`}
      >
        {editable ? (
          <DraggableFlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ from, to }) => onReorder?.(from, to)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center px-4">
                <Text className="text-gray-600 text-xs">
                  {isDropTarget ? 'タップで移動' : 'アイテムを長押しで移動'}
                </Text>
              </View>
            }
          />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
            <View className="flex-row items-center">
              {items.map((item) => (
                <TierItemComponent key={item.id} item={item} />
              ))}
              {items.length === 0 && (
                <View className="flex-1 justify-center items-center px-4">
                  <Text className="text-gray-600 text-xs">アイテムなし</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

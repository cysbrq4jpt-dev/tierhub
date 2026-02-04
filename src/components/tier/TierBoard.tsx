import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { TierRow } from './TierRow';
import { TIER_RANKS, TierItem, TierRank } from '@/types/tier.types';
import { useTierEditorStore } from '@/stores/tierStore';
import { useTierDragDrop } from '@/features/tier/hooks/useTierDragDrop';

interface TierBoardProps {
  editable?: boolean;
}

export interface TierBoardRef {
  selectItem: (item: TierItem, fromTier: TierRank | 'pool') => void;
}

export const TierBoard = forwardRef<TierBoardRef, TierBoardProps>(({ editable = false }, ref) => {
  const { tiers, pool, handleDragEnd } = useTierDragDrop();
  const { removeItem } = useTierEditorStore();
  const [selectedItem, setSelectedItem] = useState<{
    item: TierItem;
    fromTier: TierRank | 'pool';
  } | null>(null);

  // 外部からの選択（プールアイテムの長押しなど）
  useImperativeHandle(ref, () => ({
    selectItem: (item: TierItem, fromTier: TierRank | 'pool') => {
      setSelectedItem({ item, fromTier });
    },
  }));

  // 長押しでアイテムを選択
  const handleItemLongPress = useCallback((item: TierItem, tier: TierRank | 'pool') => {
    if (!editable) return;
    setSelectedItem({ item, fromTier: tier });
  }, [editable]);

  // 選択中アイテムのタップで選択解除
  const handleItemPress = useCallback((item: TierItem) => {
    if (selectedItem?.item.id === item.id) {
      setSelectedItem(null);
    }
  }, [selectedItem]);

  // TIERラベルタップで移動先に設定
  const handleTierTap = useCallback((targetTier: TierRank) => {
    if (!selectedItem) return;
    if (selectedItem.fromTier === targetTier) {
      setSelectedItem(null);
      return;
    }
    handleDragEnd({
      itemId: selectedItem.item.id,
      fromTier: selectedItem.fromTier,
      toTier: targetTier,
      newIndex: (tiers[targetTier] || []).length,
    });
    setSelectedItem(null);
  }, [selectedItem, handleDragEnd, tiers]);

  // プールへ移動
  const handleMoveToPool = useCallback(() => {
    if (!selectedItem) return;
    if (selectedItem.fromTier === 'pool') {
      setSelectedItem(null);
      return;
    }
    handleDragEnd({
      itemId: selectedItem.item.id,
      fromTier: selectedItem.fromTier,
      toTier: 'pool',
      newIndex: pool.length,
    });
    setSelectedItem(null);
  }, [selectedItem, handleDragEnd, pool.length]);

  // TIER内の並び替え
  const handleReorder = useCallback((tier: TierRank, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    handleDragEnd({
      itemId: tiers[tier][fromIndex].id,
      fromTier: tier,
      toTier: tier,
      newIndex: toIndex,
    });
  }, [handleDragEnd, tiers]);

  // アイテム削除
  const handleRemoveItem = useCallback(() => {
    if (!selectedItem) return;
    removeItem(selectedItem.item.id);
    setSelectedItem(null);
  }, [selectedItem, removeItem]);

  return (
    <View className="flex-1 bg-[#121212] p-2">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 選択中インフォバー */}
        {editable && selectedItem && (
          <View className="flex-row bg-[#2A2A2A] rounded-lg p-2 mb-2 items-center gap-2">
            <Text className="text-white text-sm flex-1">
              「{selectedItem.item.customLabel || 'アイテム'}」を移動先のTIERにタップ
            </Text>
            <TouchableOpacity onPress={handleMoveToPool} className="bg-gray-600 px-3 py-1 rounded">
              <Text className="text-white text-xs">プール</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRemoveItem} className="bg-red-600 px-3 py-1 rounded">
              <Text className="text-white text-xs">削除</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedItem(null)} className="ml-1">
              <Text className="text-gray-400 text-sm">✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {TIER_RANKS.map((rank) => (
          <TierRow
            key={rank}
            rank={rank}
            items={tiers[rank] || []}
            editable={editable}
            selectedItemId={selectedItem?.item.id}
            isDropTarget={editable && !!selectedItem && selectedItem.fromTier !== rank}
            onItemLongPress={(item) => handleItemLongPress(item, rank)}
            onItemPress={handleItemPress}
            onTierLabelTap={() => handleTierTap(rank)}
            onReorder={(from, to) => handleReorder(rank, from, to)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

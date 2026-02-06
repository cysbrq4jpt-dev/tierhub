import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { TierItem } from '@/types/tier.types';

interface AutoSnapGridProps {
  items: TierItem[];
  containerWidth?: number;
  minItemSize?: number;
  maxItemSize?: number;
}

/**
 * オート・スナップ & リフロー
 * アイテム数に応じてアイコンサイズを自動調整し、
 * 常に「1枚の美しい画像」として整列するグリッド。
 */
export const AutoSnapGrid: React.FC<AutoSnapGridProps> = ({
  items,
  containerWidth,
  minItemSize = 40,
  maxItemSize = 64,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const width = containerWidth || screenWidth - 80; // TIERラベル幅分を差し引き

  const { itemSize, columns } = useMemo(() => {
    if (items.length === 0) return { itemSize: maxItemSize, columns: 1 };

    // コンテナ幅から最適なアイコンサイズを逆算
    const gap = 4;
    let bestSize = maxItemSize;
    let bestCols = Math.floor((width + gap) / (maxItemSize + gap));

    // アイテム数がcolumns数を超える場合、サイズを縮小
    if (items.length > bestCols) {
      const rowsNeeded = Math.ceil(items.length / bestCols);
      // 1行に収まるように試行
      if (rowsNeeded === 1) {
        bestCols = items.length;
        bestSize = Math.max(minItemSize, Math.floor((width - gap * (bestCols - 1)) / bestCols));
      } else {
        // 複数行でも美しく収まるように調整
        bestCols = Math.ceil(Math.sqrt(items.length * (width / maxItemSize)));
        bestSize = Math.max(minItemSize, Math.floor((width - gap * (bestCols - 1)) / bestCols));
        bestCols = Math.floor((width + gap) / (bestSize + gap));
      }
    }

    return {
      itemSize: Math.min(maxItemSize, Math.max(minItemSize, bestSize)),
      columns: Math.max(1, bestCols),
    };
  }, [items.length, width, minItemSize, maxItemSize]);

  return (
    <View className="flex-row flex-wrap" style={{ gap: 4 }}>
      {items.map((item) => (
        <View
          key={item.id}
          style={{ width: itemSize, height: itemSize }}
          className="rounded overflow-hidden bg-gray-700 items-center justify-center"
        >
          {item.customImageUrl ? (
            <View className="w-full h-full bg-gray-600">
              {/* Image は親コンポーネントでTierItemとして描画 */}
              <Text className="text-white text-xs text-center" numberOfLines={1}>
                {item.customLabel || ''}
              </Text>
            </View>
          ) : (
            <Text
              className="text-gray-300 text-center"
              style={{ fontSize: itemSize > 48 ? 11 : 9 }}
              numberOfLines={2}
            >
              {item.customLabel || 'Item'}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

import React, { forwardRef } from 'react';
import { View, Text, Image } from 'react-native';
import { OGPConfig, OGPHighlightItem } from '@/types/sns.types';

interface OGPPreviewProps {
  config: OGPConfig;
}

const CHANGE_DIRECTION_ICONS: Record<string, { icon: string; color: string }> = {
  up: { icon: '▲', color: '#4CAF50' },
  down: { icon: '▼', color: '#F44336' },
  same: { icon: '—', color: '#757575' },
  new: { icon: '★', color: '#2196F3' },
};

/**
 * OGPプレビュー
 * X（Twitter）シェア時のOGP画像プレビュー。
 * キャッチコピー + Tier表サマリーを合成した1200x630画像。
 */
export const OGPPreview = forwardRef<View, OGPPreviewProps>(
  ({ config }, ref) => {
    return (
      <View
        ref={ref}
        className="bg-[#0D1117]"
        style={{ width: 1200, height: 630 }}
      >
        {/* 背景グラデーション風 */}
        <View className="absolute inset-0 bg-[#0D1117]" />

        {/* メインコンテンツ */}
        <View className="flex-1 p-8">
          {/* カテゴリ + パッチ情報 */}
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-600 px-3 py-1 rounded mr-2">
              <Text className="text-white text-sm font-bold">
                {config.categoryName}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm">
              Patch {config.patchVersion}
            </Text>
          </View>

          {/* タイトル */}
          <Text
            className="text-white text-3xl font-bold mb-3"
            numberOfLines={2}
          >
            {config.title}
          </Text>

          {/* キャッチコピー */}
          <View className="bg-yellow-600/20 border-l-4 border-yellow-500 px-4 py-2 mb-6">
            <Text className="text-yellow-300 text-lg font-bold">
              {config.catchCopy}
            </Text>
          </View>

          {/* ハイライトアイテム */}
          {config.topItems.length > 0 && (
            <View className="flex-row gap-3">
              {config.topItems.slice(0, 5).map((item, index) => (
                <OGPHighlightCard key={index} item={item} rank={index + 1} />
              ))}
            </View>
          )}

          {/* フッター: TierHubブランディング */}
          <View className="absolute bottom-6 left-8 right-8 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-blue-400 text-xl font-bold">TierHub</Text>
              <Text className="text-gray-500 text-sm ml-2">tierhub.app</Text>
            </View>
            <Text className="text-gray-600 text-xs">#TierHub</Text>
          </View>
        </View>
      </View>
    );
  }
);

// ハイライトカード
const OGPHighlightCard: React.FC<{ item: OGPHighlightItem; rank: number }> = ({
  item,
  rank,
}) => {
  const dirInfo = CHANGE_DIRECTION_ICONS[item.changeDirection || 'same'];

  return (
    <View className="bg-[#1A1A2E] rounded-lg p-3 min-w-[120px] items-center">
      {/* 順位 */}
      <Text className="text-gray-500 text-xs mb-1">#{rank}</Text>

      {/* キャラ名 */}
      <Text className="text-white text-sm font-bold text-center" numberOfLines={1}>
        {item.itemName}
      </Text>

      {/* Tier */}
      <View className="flex-row items-center mt-1">
        {item.previousTier && item.previousTier !== item.tier && (
          <>
            <Text className="text-gray-500 text-xs">{item.previousTier}</Text>
            <Text className="text-gray-600 text-xs mx-1">→</Text>
          </>
        )}
        <Text className="text-yellow-400 text-lg font-bold">{item.tier}</Text>
        {dirInfo && (
          <Text style={{ color: dirInfo.color, fontSize: 12, marginLeft: 2 }}>
            {dirInfo.icon}
          </Text>
        )}
      </View>
    </View>
  );
};

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { TierDelta } from '@/types/version.types';
import { TIER_RANKS } from '@/types/tier.types';

interface VersionDiffViewProps {
  deltas: TierDelta[];
  itemNames: Record<string, string>; // itemId -> name
  fromVersion: string; // 表示用バージョン名
  toVersion: string;
}

const DIRECTION_CONFIG: Record<
  string,
  { icon: string; label: string; bg: string; text: string }
> = {
  up: { icon: '▲', label: 'ランクUP', bg: 'bg-green-900/50', text: 'text-green-400' },
  down: { icon: '▼', label: 'ランクDOWN', bg: 'bg-red-900/50', text: 'text-red-400' },
  new: { icon: '★', label: '新規追加', bg: 'bg-blue-900/50', text: 'text-blue-400' },
  removed: {
    icon: '✕',
    label: '削除',
    bg: 'bg-gray-900/50',
    text: 'text-gray-400',
  },
};

/**
 * バージョン差分ビュー (Diff View)
 * 2つのバージョン間の変更を一覧表示。
 */
export const VersionDiffView: React.FC<VersionDiffViewProps> = ({
  deltas,
  itemNames,
  fromVersion,
  toVersion,
}) => {
  if (deltas.length === 0) {
    return (
      <View className="p-6 items-center">
        <Text className="text-gray-500 text-sm">変更点はありません</Text>
      </View>
    );
  }

  // 変更方向ごとにグループ化
  const grouped: Record<string, TierDelta[]> = {
    up: [],
    down: [],
    new: [],
    removed: [],
  };
  deltas.forEach((d) => {
    if (grouped[d.direction]) {
      grouped[d.direction].push(d);
    }
  });

  return (
    <ScrollView className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="px-4 py-3 border-b border-gray-800">
        <Text className="text-white text-base font-bold">バージョン差分</Text>
        <Text className="text-gray-400 text-xs mt-0.5">
          {fromVersion} → {toVersion} ・ {deltas.length}件の変更
        </Text>
      </View>

      {/* 変更カテゴリ別に表示 */}
      {(['up', 'down', 'new', 'removed'] as const).map((direction) => {
        const items = grouped[direction];
        if (!items || items.length === 0) return null;

        const config = DIRECTION_CONFIG[direction];

        return (
          <View key={direction} className="mx-4 mt-3">
            {/* セクションヘッダー */}
            <View className="flex-row items-center mb-2">
              <Text className={`text-sm mr-1 ${config.text}`}>{config.icon}</Text>
              <Text className={`text-sm font-bold ${config.text}`}>
                {config.label} ({items.length})
              </Text>
            </View>

            {/* アイテムリスト */}
            {items.map((delta) => (
              <View
                key={delta.itemId}
                className={`flex-row items-center rounded-lg px-3 py-2 mb-1 ${config.bg}`}
              >
                <Text className="text-white text-sm flex-1">
                  {itemNames[delta.itemId] || delta.itemId}
                </Text>
                {delta.previousTier && delta.currentTier && (
                  <View className="flex-row items-center">
                    <TierBadge tier={delta.previousTier} muted />
                    <Text className="text-gray-500 mx-1">→</Text>
                    <TierBadge tier={delta.currentTier} />
                  </View>
                )}
                {delta.direction === 'new' && (
                  <TierBadge tier={delta.currentTier} />
                )}
              </View>
            ))}
          </View>
        );
      })}

      <View className="h-8" />
    </ScrollView>
  );
};

// Tierバッジ
const TIER_BADGE_COLORS: Record<string, string> = {
  S: '#FF7F7F',
  A: '#FFBF7F',
  B: '#FFDF7F',
  C: '#FFFF7F',
  D: '#BFFF7F',
  F: '#7FBFFF',
};

const TierBadge: React.FC<{ tier: string; muted?: boolean }> = ({
  tier,
  muted = false,
}) => {
  const color = TIER_BADGE_COLORS[tier] || '#757575';

  return (
    <View
      className="px-2 py-0.5 rounded"
      style={{
        backgroundColor: muted ? `${color}30` : `${color}50`,
        borderWidth: 1,
        borderColor: muted ? `${color}40` : color,
      }}
    >
      <Text
        style={{
          color: muted ? `${color}80` : color,
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        {tier}
      </Text>
    </View>
  );
};

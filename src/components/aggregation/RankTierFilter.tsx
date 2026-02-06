import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  AggregationFilter,
  RankTier,
  RANK_TIER_LABELS,
} from '@/types/aggregation.types';

interface RankTierFilterProps {
  currentFilter: AggregationFilter;
  sampleCounts: Record<RankTier | 'all', number>;
  onFilterChange: (filter: AggregationFilter) => void;
}

/**
 * ランク帯別フィルタリング
 * 「プロ・上級者・一般層」のデータを切り替えて集計・表示。
 */
export const RankTierFilter: React.FC<RankTierFilterProps> = ({
  currentFilter,
  sampleCounts,
  onFilterChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const rankTiers: (RankTier | 'all')[] = ['all', 'pro', 'advanced', 'general'];
  const labels: Record<string, string> = {
    all: '全体',
    ...RANK_TIER_LABELS,
  };

  const activeRank = currentFilter.rankTier || 'all';

  return (
    <View className="bg-[#1A1A1A] rounded-lg p-3">
      {/* メインフィルタ */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-sm font-bold">データフィルタ</Text>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text className="text-blue-400 text-xs">
            {showAdvanced ? '簡易表示' : '詳細フィルタ'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ランク帯タブ */}
      <View className="flex-row gap-1">
        {rankTiers.map((rank) => {
          const isActive = activeRank === rank;
          const count = sampleCounts[rank] || 0;

          return (
            <TouchableOpacity
              key={rank}
              onPress={() => {
                onFilterChange({
                  ...currentFilter,
                  rankTier: rank === 'all' ? undefined : (rank as RankTier),
                });
              }}
              className={`flex-1 py-2 rounded items-center ${
                isActive ? 'bg-blue-600' : 'bg-[#2A2A2A]'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {labels[rank]}
              </Text>
              <Text
                className={`text-xs mt-0.5 ${
                  isActive ? 'text-blue-200' : 'text-gray-600'
                }`}
                style={{ fontSize: 9 }}
              >
                {count}件
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 詳細フィルタ */}
      {showAdvanced && (
        <View className="mt-3 pt-3 border-t border-gray-800">
          {/* フォロワー数フィルタ */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-400 text-xs">最小フォロワー数</Text>
            <View className="flex-row gap-1">
              {[0, 100, 1000, 10000].map((min) => (
                <TouchableOpacity
                  key={min}
                  onPress={() => {
                    onFilterChange({
                      ...currentFilter,
                      minFollowers: min === 0 ? undefined : min,
                    });
                  }}
                  className={`px-2 py-1 rounded ${
                    (currentFilter.minFollowers || 0) === min
                      ? 'bg-blue-600'
                      : 'bg-gray-700'
                  }`}
                >
                  <Text className="text-white text-xs">
                    {min === 0 ? '制限なし' : `${min}+`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* バッジ保持者フィルタ */}
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs">実績バッジ保持者のみ</Text>
            <TouchableOpacity
              onPress={() => {
                onFilterChange({
                  ...currentFilter,
                  hasBadge: !currentFilter.hasBadge,
                });
              }}
              className={`px-3 py-1 rounded ${
                currentFilter.hasBadge ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            >
              <Text className="text-white text-xs">
                {currentFilter.hasBadge ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 適用中フィルタのサマリー */}
          <View className="mt-2 bg-[#2A2A2A] rounded p-2">
            <Text className="text-gray-500 text-xs">
              適用中: {activeRank !== 'all' ? labels[activeRank] : '全ランク帯'}
              {currentFilter.minFollowers
                ? ` / ${currentFilter.minFollowers}+フォロワー`
                : ''}
              {currentFilter.hasBadge ? ' / バッジ保持者' : ''}
              {' → '}
              <Text className="text-white font-bold">
                {sampleCounts[activeRank] || 0}件のデータ
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

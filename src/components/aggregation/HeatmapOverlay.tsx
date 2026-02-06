import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HeatmapData, HEAT_COLORS, NUMERIC_TIER_MAP } from '@/types/aggregation.types';

interface HeatmapOverlayProps {
  data: HeatmapData[];
  itemNames: Record<string, string>; // itemId -> name
  enabled: boolean;
  onToggle: () => void;
}

/**
 * ヒートマップ・オーバーレイ
 * 自分のTier表の上に全ユーザーの平均評価を「熱量（色）」で重ねて、
 * 世論とのズレを数値化して表示。
 */
export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  data,
  itemNames,
  enabled,
  onToggle,
}) => {
  const [selectedItem, setSelectedItem] = useState<HeatmapData | null>(null);

  // 全体のズレ度平均
  const averageDeviation =
    data.length > 0
      ? Math.round(
          data.reduce((sum, d) => sum + Math.abs(d.deviationPercent), 0) / data.length
        )
      : 0;

  return (
    <View className="bg-[#1A1A1A] rounded-xl">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-3 border-b border-gray-800">
        <View>
          <Text className="text-white text-sm font-bold">集合知オーバーレイ</Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            あなたの評価は世間と平均{averageDeviation}%ズレています
          </Text>
        </View>
        <TouchableOpacity
          onPress={onToggle}
          className={`px-3 py-1.5 rounded ${enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <Text className="text-white text-xs">{enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      {enabled && (
        <ScrollView className="max-h-64" showsVerticalScrollIndicator={false}>
          {data.map((item) => {
            const name = itemNames[item.itemId] || item.itemId;
            const heatColor = HEAT_COLORS[item.heatLevel];
            const avgTierLabel =
              NUMERIC_TIER_MAP[Math.round(item.communityAvgTier)] || '?';
            const isSelected = selectedItem?.itemId === item.itemId;

            return (
              <TouchableOpacity
                key={item.itemId}
                onPress={() => setSelectedItem(isSelected ? null : item)}
                className={`flex-row items-center px-3 py-2 border-b border-gray-800/30 ${
                  isSelected ? 'bg-[#2A2A2A]' : ''
                }`}
              >
                {/* ヒートインジケーター */}
                <View
                  className="w-2 h-8 rounded-full mr-2"
                  style={{ backgroundColor: heatColor }}
                />

                {/* アイテム名 */}
                <Text className="text-white text-sm flex-1" numberOfLines={1}>
                  {name}
                </Text>

                {/* ユーザー評価 */}
                <View className="items-center mx-2">
                  <Text className="text-gray-500 text-xs" style={{ fontSize: 8 }}>
                    あなた
                  </Text>
                  <Text className="text-white text-xs font-bold">{item.userTier}</Text>
                </View>

                {/* 矢印 */}
                <Text className="text-gray-500 text-xs mx-1">vs</Text>

                {/* コミュニティ平均 */}
                <View className="items-center mx-2">
                  <Text className="text-gray-500 text-xs" style={{ fontSize: 8 }}>
                    平均
                  </Text>
                  <Text className="text-gray-300 text-xs font-bold">
                    {avgTierLabel}
                  </Text>
                </View>

                {/* ズレ度 */}
                <View
                  className="px-2 py-0.5 rounded min-w-[48px] items-center"
                  style={{ backgroundColor: `${heatColor}30` }}
                >
                  <Text style={{ color: heatColor, fontSize: 11, fontWeight: 'bold' }}>
                    {item.deviationPercent > 0 ? '+' : ''}
                    {item.deviationPercent}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

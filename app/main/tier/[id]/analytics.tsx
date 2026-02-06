import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HeatmapOverlay } from '@/components/aggregation/HeatmapOverlay';
import { RankTierFilter } from '@/components/aggregation/RankTierFilter';
import { ExplanationMemo } from '@/components/aggregation/ExplanationMemo';
import {
  aggregateTierData,
  generateHeatmapData,
  saveItemExplanation,
  getTierListExplanations,
} from '@/features/aggregation/services/aggregationService';
import {
  AggregatedTierData,
  AggregationFilter,
  HeatmapData,
  ItemExplanation,
  RankTier,
} from '@/types/aggregation.types';
import { useAuthStore } from '@/stores/authStore';
import { getTierList } from '@/features/tier/services/tierService';
import { TierList, TIER_RANKS } from '@/types/tier.types';

export default function TierListAnalytics() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [tierList, setTierList] = useState<TierList | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedTierData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<AggregationFilter>({});
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'explanations'>('heatmap');

  // サンプル数（モック）
  const sampleCounts: Record<RankTier | 'all', number> = {
    all: aggregatedData.reduce((sum, d) => sum + d.sampleCount, 0),
    pro: 0,
    advanced: 0,
    general: 0,
  };

  // アイテム名マップ
  const [itemNames, setItemNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!id || !user) return;
      try {
        // Tier表を取得
        const list = await getTierList(id);
        setTierList(list);

        if (list) {
          // ユーザーの配置マップ生成
          const userTiers: Record<string, string> = {};
          const names: Record<string, string> = {};

          for (const rank of TIER_RANKS) {
            const items = list.tiers[rank] || [];
            for (const item of items) {
              const itemId = item.masterItemId || item.id;
              userTiers[itemId] = rank;
              names[itemId] = item.customLabel || itemId;
            }
          }
          setItemNames(names);

          // 集計データ取得
          const agg = await aggregateTierData(list.categoryId, 'latest', filter);
          setAggregatedData(agg);

          // ヒートマップ生成
          const heatmap = generateHeatmapData(userTiers, agg);
          setHeatmapData(heatmap);

          // 解説メモ取得
          const explanationDocs = await getTierListExplanations(id, user.id);
          const expMap: Record<string, string> = {};
          explanationDocs.forEach((doc) => {
            expMap[doc.itemId] = doc.explanation;
          });
          setExplanations(expMap);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, filter]);

  const handleSaveExplanation = useCallback(
    async (itemId: string, explanation: string) => {
      if (!user || !id) return;
      try {
        await saveItemExplanation(id, itemId, user.id, explanation);
        setExplanations((prev) => ({ ...prev, [itemId]: explanation }));
      } catch (error) {
        console.error('Failed to save explanation:', error);
      }
    },
    [user, id]
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator color="#2196F3" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">分析 & 解説</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* タブ */}
      <View className="flex-row border-b border-gray-800">
        {(['heatmap', 'explanations'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab ? 'border-b-2 border-blue-500' : ''
            }`}
          >
            <Text
              className={`text-sm ${
                activeTab === tab ? 'text-white font-bold' : 'text-gray-400'
              }`}
            >
              {tab === 'heatmap' ? '集合知ヒートマップ' : '解説メモ'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 p-4">
        {activeTab === 'heatmap' ? (
          <View className="gap-4">
            {/* ランク帯フィルタ */}
            <RankTierFilter
              currentFilter={filter}
              sampleCounts={sampleCounts}
              onFilterChange={setFilter}
            />

            {/* ヒートマップ */}
            <HeatmapOverlay
              data={heatmapData}
              itemNames={itemNames}
              enabled={heatmapEnabled}
              onToggle={() => setHeatmapEnabled(!heatmapEnabled)}
            />
          </View>
        ) : (
          <View>
            <Text className="text-gray-400 text-xs mb-3">
              各キャラの配置理由をメモとして残せます。ホバーで表示される解説として公開されます。
            </Text>
            {tierList &&
              TIER_RANKS.map((rank) => {
                const items = tierList.tiers[rank] || [];
                if (items.length === 0) return null;

                return (
                  <View key={rank}>
                    <Text className="text-gray-500 text-xs font-bold mb-1 mt-3">
                      {rank} Tier
                    </Text>
                    {items.map((item) => {
                      const itemId = item.masterItemId || item.id;
                      return (
                        <ExplanationMemo
                          key={itemId}
                          itemId={itemId}
                          itemName={item.customLabel || itemId}
                          currentTier={rank}
                          explanation={explanations[itemId] || ''}
                          onSave={handleSaveExplanation}
                        />
                      );
                    })}
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MatchupMatrix } from '@/components/matchup/MatchupMatrix';
import { RadarChartView } from '@/components/matchup/RadarChartView';
import { useMatchupEditorStore } from '@/stores/matchupStore';
import { getMatchupTable } from '@/features/matchup/services/matchupService';
import { MatchupTable, getMatchupValue } from '@/types/matchup.types';

export default function MatchupDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { setFocusedCharacter, focusedCharacterId } = useMatchupEditorStore();

  const [table, setTable] = useState<MatchupTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'matrix' | 'radar'>('matrix');
  const [charNames, setCharNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await getMatchupTable(id);
        setTable(data);
        // キャラ名マップを生成（実際にはmasterItemsからフェッチ）
        if (data) {
          const names: Record<string, string> = {};
          data.characters.forEach((charId, i) => {
            names[charId] = charId.slice(0, 8); // 簡易表示
          });
          setCharNames(names);
        }
      } catch (error) {
        console.error('Failed to load matchup table:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCharacterFocus = useCallback(
    (charId: string) => {
      setFocusedCharacter(charId);
      setViewMode('radar');
    },
    [setFocusedCharacter]
  );

  if (loading) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <ActivityIndicator color="#2196F3" size="large" />
      </View>
    );
  }

  if (!table) {
    return (
      <View className="flex-1 bg-[#121212] items-center justify-center">
        <Text className="text-gray-500">相性表が見つかりません</Text>
      </View>
    );
  }

  const radarData = focusedCharacterId
    ? table.characters
        .filter((cId) => cId !== focusedCharacterId)
        .map((cId) => ({
          characterId: cId,
          characterName: charNames[cId] || cId,
          value: getMatchupValue(table.cells, focusedCharacterId, cId),
        }))
    : [];

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <View className="flex-1 mx-4">
          <Text className="text-white text-lg font-bold text-center" numberOfLines={1}>
            {table.title}
          </Text>
          <Text className="text-gray-400 text-xs text-center">
            Patch {table.patchVersion} ・ {table.characters.length}キャラ
          </Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* ビュー切り替え */}
      <View className="flex-row px-4 py-2 gap-2">
        <TouchableOpacity
          onPress={() => setViewMode('matrix')}
          className={`px-3 py-1 rounded ${
            viewMode === 'matrix' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <Text className="text-white text-sm">マトリックス</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (focusedCharacterId) setViewMode('radar');
          }}
          className={`px-3 py-1 rounded ${
            viewMode === 'radar' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <Text className="text-white text-sm">レーダー</Text>
        </TouchableOpacity>
      </View>

      {/* コンテンツ */}
      <View className="flex-1">
        {viewMode === 'matrix' ? (
          <MatchupMatrix
            characterNames={charNames}
            editable={false}
            onCharacterFocus={handleCharacterFocus}
          />
        ) : focusedCharacterId ? (
          <ScrollView>
            <RadarChartView
              focusedCharacterName={charNames[focusedCharacterId] || '???'}
              data={radarData}
              onClose={() => setViewMode('matrix')}
            />
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

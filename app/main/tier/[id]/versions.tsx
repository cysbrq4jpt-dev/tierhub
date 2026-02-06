import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VersionTimeline } from '@/components/version/VersionTimeline';
import { VersionDiffView } from '@/components/version/VersionDiffView';
import { useVersionStore } from '@/stores/versionStore';
import {
  getVersionTimeline,
  getTierListVersion,
  calculateDeltas,
} from '@/features/version/services/versionService';
import { VersionTimelineEntry, TierListVersion, TierDelta } from '@/types/version.types';

export default function TierListVersions() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    setVersions,
    setSelectedVersion,
    setPreviousVersion,
    setDeltas,
    versions,
    selectedVersion,
    previousVersion,
    deltas,
    ghostEnabled,
    toggleGhost,
  } = useVersionStore();

  const [loading, setLoading] = useState(true);
  const [itemNames] = useState<Record<string, string>>({}); // 実際にはmasterItemsからフェッチ

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const timeline = await getVersionTimeline(id);
        setVersions(timeline);

        // 最新バージョンを自動選択
        if (timeline.length > 0) {
          const latest = await getTierListVersion(timeline[0].versionId);
          setSelectedVersion(latest);

          if (timeline.length > 1) {
            const prev = await getTierListVersion(timeline[1].versionId);
            setPreviousVersion(prev);

            if (latest && prev) {
              const d = calculateDeltas(prev.tiers, latest.tiers);
              setDeltas(d);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load versions:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleVersionSelect = useCallback(
    async (versionId: string) => {
      try {
        const version = await getTierListVersion(versionId);
        if (!version) return;

        // 前のバージョンを見つける
        const currentIndex = versions.findIndex((v) => v.versionId === versionId);
        const prevEntry = versions[currentIndex + 1]; // 降順なので+1

        setSelectedVersion(version);

        if (prevEntry) {
          const prev = await getTierListVersion(prevEntry.versionId);
          setPreviousVersion(prev);

          if (prev) {
            const d = calculateDeltas(prev.tiers, version.tiers);
            setDeltas(d);
          }
        } else {
          setPreviousVersion(null);
          setDeltas([]);
        }
      } catch (error) {
        console.error('Failed to load version:', error);
      }
    },
    [versions, setSelectedVersion, setPreviousVersion, setDeltas]
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
        <Text className="text-white text-lg font-bold">バージョン履歴</Text>
        <TouchableOpacity
          onPress={toggleGhost}
          className={`px-3 py-1 rounded ${ghostEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          <Text className="text-white text-xs">
            ゴースト{ghostEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* タイムライン */}
      <VersionTimeline
        entries={versions}
        onVersionSelect={handleVersionSelect}
      />

      {/* 選択バージョン情報 */}
      {selectedVersion && (
        <View className="px-4 py-2 border-b border-gray-800">
          <Text className="text-white text-sm font-bold">
            v{selectedVersion.versionNumber} - {selectedVersion.patchVersion}
          </Text>
          {selectedVersion.notes && (
            <Text className="text-gray-400 text-xs mt-0.5">
              {selectedVersion.notes}
            </Text>
          )}
        </View>
      )}

      {/* 差分ビュー */}
      <View className="flex-1">
        {deltas.length > 0 && previousVersion && selectedVersion ? (
          <VersionDiffView
            deltas={deltas}
            itemNames={itemNames}
            fromVersion={`v${previousVersion.versionNumber}`}
            toVersion={`v${selectedVersion.versionNumber}`}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500 text-sm">
              {versions.length === 0
                ? 'バージョン履歴はありません'
                : versions.length === 1
                  ? '初回バージョンです（比較対象なし）'
                  : 'バージョンを選択して差分を表示'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

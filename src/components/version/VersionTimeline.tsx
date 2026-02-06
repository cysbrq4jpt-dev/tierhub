import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { VersionTimelineEntry } from '@/types/version.types';
import { useVersionStore } from '@/stores/versionStore';
import { format } from 'date-fns';

interface VersionTimelineProps {
  entries: VersionTimelineEntry[];
  onVersionSelect: (versionId: string) => void;
}

/**
 * タイムトラベル・アーカイブ
 * パッチ（Ver.）ごとの履歴を横スクロールのタイムラインで表示。
 * ユーザーは「あの時の評価」へいつでも遡れる。
 */
export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  entries,
  onVersionSelect,
}) => {
  const { currentVersionId } = useVersionStore();

  if (entries.length === 0) {
    return (
      <View className="p-4">
        <Text className="text-gray-500 text-sm text-center">
          バージョン履歴はありません
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-[#1A1A1A] border-b border-gray-800">
      <View className="flex-row items-center px-3 pt-2">
        <Text className="text-white text-sm font-bold">バージョン履歴</Text>
        <Text className="text-gray-500 text-xs ml-2">{entries.length} versions</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-2 px-2"
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {entries.map((entry, index) => {
          const isSelected = currentVersionId === entry.versionId;
          const isLatest = index === 0;

          return (
            <TouchableOpacity
              key={entry.versionId}
              onPress={() => onVersionSelect(entry.versionId)}
              className={`mx-1 rounded-lg px-3 py-2 min-w-[100px] ${
                isSelected
                  ? 'bg-blue-600 border border-blue-400'
                  : 'bg-[#2A2A2A] border border-gray-700'
              }`}
            >
              {/* バージョン番号 */}
              <View className="flex-row items-center">
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  v{entry.versionNumber}
                </Text>
                {isLatest && (
                  <View className="bg-green-600 px-1 py-0.5 rounded ml-1">
                    <Text className="text-white text-xs" style={{ fontSize: 8 }}>
                      最新
                    </Text>
                  </View>
                )}
              </View>

              {/* パッチバージョン */}
              <Text
                className={`text-xs mt-0.5 ${
                  isSelected ? 'text-blue-100' : 'text-gray-400'
                }`}
                numberOfLines={1}
              >
                {entry.patchVersion}
              </Text>

              {/* 変更数 */}
              {entry.deltaCount > 0 && (
                <Text
                  className={`text-xs mt-0.5 ${
                    isSelected ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {entry.deltaCount}件の変更
                </Text>
              )}

              {/* 日付 */}
              <Text
                className={`text-xs mt-0.5 ${
                  isSelected ? 'text-blue-200' : 'text-gray-600'
                }`}
                style={{ fontSize: 9 }}
              >
                {format(new Date(entry.createdAt), 'yyyy/MM/dd')}
              </Text>

              {/* タイムライン線（接続） */}
              {index < entries.length - 1 && (
                <View className="absolute right-0 top-1/2 w-2 h-0.5 bg-gray-600 -mr-2" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

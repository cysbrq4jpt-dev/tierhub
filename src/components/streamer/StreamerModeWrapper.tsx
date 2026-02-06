import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useStreamerStore } from '@/stores/streamerStore';
import { CHROMA_KEY_VALUES } from '@/types/streamer.types';

interface StreamerModeWrapperProps {
  children: React.ReactNode;
}

/**
 * ストリーマー・モード全体ラッパー
 * クロマキー背景透過、UI最小化（フォーカスモード）を統合管理。
 */
export const StreamerModeWrapper: React.FC<StreamerModeWrapperProps> = ({
  children,
}) => {
  const { config } = useStreamerStore();

  if (!config.enabled) {
    return <View className="flex-1">{children}</View>;
  }

  const bgColor = config.chromaKeyEnabled
    ? CHROMA_KEY_VALUES[config.chromaKeyColor]
    : '#121212';

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      {children}
      {/* フォーカスモード時は操作パネルを非表示 */}
      {!config.focusModeEnabled && <StreamerControlBar />}
    </View>
  );
};

/**
 * ストリーマーコントロールバー
 * 配信中の操作パネル（ホバー時のみ表示する設計）
 */
const StreamerControlBar: React.FC = () => {
  const {
    config,
    toggleChromaKey,
    setChromaKeyColor,
    toggleFocusMode,
    toggleWidget,
  } = useStreamerStore();

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-black/80 p-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-2">
          {/* クロマキー切り替え */}
          <TouchableOpacity
            onPress={toggleChromaKey}
            className={`px-3 py-1.5 rounded ${
              config.chromaKeyEnabled ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white text-xs">
              {config.chromaKeyEnabled ? '🟢 透過ON' : '透過OFF'}
            </Text>
          </TouchableOpacity>

          {/* クロマキー色選択 */}
          {config.chromaKeyEnabled && (
            <View className="flex-row gap-1">
              {(['green', 'blue', 'magenta'] as const).map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setChromaKeyColor(color)}
                  className={`w-7 h-7 rounded-full border-2 ${
                    config.chromaKeyColor === color
                      ? 'border-white'
                      : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: CHROMA_KEY_VALUES[color] }}
                />
              ))}
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          {/* フォーカスモード */}
          <TouchableOpacity
            onPress={toggleFocusMode}
            className="bg-gray-700 px-3 py-1.5 rounded"
          >
            <Text className="text-white text-xs">フルスクリーン</Text>
          </TouchableOpacity>

          {/* ウィジェット */}
          <TouchableOpacity
            onPress={toggleWidget}
            className={`px-3 py-1.5 rounded ${
              config.widgetEnabled ? 'bg-purple-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white text-xs">
              {config.widgetEnabled ? '📊 投票ON' : '投票OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

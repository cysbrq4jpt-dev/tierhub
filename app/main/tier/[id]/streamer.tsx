import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStreamerStore } from '@/stores/streamerStore';
import { StreamerModeWrapper } from '@/components/streamer/StreamerModeWrapper';
import { VotingWidget, VotingQRCode } from '@/components/streamer/VotingWidget';
import { TierBoard } from '@/components/tier/TierBoard';
import {
  createVotingSession,
  endVotingSession,
  generateVotingUrl,
} from '@/features/streamer/services/votingService';
import { useAuthStore } from '@/stores/authStore';
import { CHROMA_KEY_LABELS, ChromaKeyColor } from '@/types/streamer.types';

export default function StreamerMode() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    config,
    toggleStreamerMode,
    toggleChromaKey,
    setChromaKeyColor,
    toggleFocusMode,
    toggleWidget,
    activeSessionId,
    setActiveSession,
    setWidgetDisplayMode,
  } = useStreamerStore();

  const [showSettings, setShowSettings] = useState(true);
  const [votingUrl, setVotingUrl] = useState('');

  // ストリーマーモード有効化
  useEffect(() => {
    if (!config.enabled) {
      toggleStreamerMode();
    }
    return () => {
      if (config.enabled) {
        toggleStreamerMode();
      }
    };
  }, []);

  // 投票セッション開始
  const handleStartVoting = useCallback(async () => {
    if (!user || !id) return;

    try {
      const session = await createVotingSession(id, user.id, 'リスナー投票', [
        { label: 'S Tier', imageUrl: null },
        { label: 'A Tier', imageUrl: null },
        { label: 'B Tier', imageUrl: null },
        { label: 'C Tier', imageUrl: null },
        { label: 'D Tier', imageUrl: null },
        { label: 'F Tier', imageUrl: null },
      ]);
      setActiveSession(session.id);
      setVotingUrl(generateVotingUrl(session.id, 'https://tierhub.app'));
      toggleWidget();
    } catch (error) {
      Alert.alert('エラー', '投票セッションの作成に失敗しました');
    }
  }, [user, id, setActiveSession, toggleWidget]);

  // 投票セッション終了
  const handleEndVoting = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      await endVotingSession(activeSessionId);
      setActiveSession(null);
      if (config.widgetEnabled) toggleWidget();
    } catch (error) {
      Alert.alert('エラー', '投票セッションの終了に失敗しました');
    }
  }, [activeSessionId, config.widgetEnabled, setActiveSession, toggleWidget]);

  return (
    <StreamerModeWrapper>
      <View className="flex-1">
        {/* ヘッダー（フォーカスモード時は非表示） */}
        {!config.focusModeEnabled && (
          <View className="flex-row items-center justify-between p-4 border-b border-gray-800/50">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-blue-500 text-base">← 戻る</Text>
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View className="bg-red-600 px-2 py-0.5 rounded mr-2">
                <Text className="text-white text-xs font-bold">STREAMER</Text>
              </View>
              <Text className="text-white text-base font-bold">配信モード</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              className="px-3 py-1 bg-gray-700 rounded"
            >
              <Text className="text-white text-xs">設定</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 設定パネル */}
        {showSettings && !config.focusModeEnabled && (
          <View className="bg-[#1A1A1A] border-b border-gray-800 p-3">
            {/* クロマキー設定 */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-sm">背景透過</Text>
              <View className="flex-row items-center gap-2">
                {(['green', 'blue', 'magenta', 'transparent'] as ChromaKeyColor[]).map(
                  (color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => {
                        if (!config.chromaKeyEnabled) toggleChromaKey();
                        setChromaKeyColor(color);
                      }}
                      className={`px-2 py-1 rounded ${
                        config.chromaKeyEnabled && config.chromaKeyColor === color
                          ? 'bg-blue-600'
                          : 'bg-gray-700'
                      }`}
                    >
                      <Text className="text-white text-xs">{CHROMA_KEY_LABELS[color]}</Text>
                    </TouchableOpacity>
                  )
                )}
                {config.chromaKeyEnabled && (
                  <TouchableOpacity
                    onPress={toggleChromaKey}
                    className="bg-red-600 px-2 py-1 rounded"
                  >
                    <Text className="text-white text-xs">OFF</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* UI最小化 */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-sm">フルスクリーン (F)</Text>
              <TouchableOpacity
                onPress={toggleFocusMode}
                className={`px-3 py-1 rounded ${
                  config.focusModeEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <Text className="text-white text-xs">
                  {config.focusModeEnabled ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 投票ウィジェット */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-400 text-sm">リアルタイム投票</Text>
              <View className="flex-row gap-2">
                {!activeSessionId ? (
                  <TouchableOpacity
                    onPress={handleStartVoting}
                    className="bg-purple-600 px-3 py-1 rounded"
                  >
                    <Text className="text-white text-xs">投票開始</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        setWidgetDisplayMode(
                          useStreamerStore.getState().widgetConfig.displayMode === 'bar'
                            ? 'pie'
                            : 'bar'
                        )
                      }
                      className="bg-gray-700 px-2 py-1 rounded"
                    >
                      <Text className="text-white text-xs">表示切替</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleEndVoting}
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      <Text className="text-white text-xs">投票終了</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* QRコード（投票セッション中） */}
            {activeSessionId && votingUrl && (
              <View className="items-center mt-2">
                <VotingQRCode votingUrl={votingUrl} />
              </View>
            )}
          </View>
        )}

        {/* メインコンテンツ：Tier表 */}
        <View className="flex-1">
          <TierBoard editable={false} />
        </View>

        {/* 投票ウィジェットオーバーレイ */}
        {config.widgetEnabled && activeSessionId && (
          <View className="absolute bottom-20 right-4 w-64">
            <VotingWidget sessionId={activeSessionId} compact />
          </View>
        )}
      </View>
    </StreamerModeWrapper>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useStreamerStore } from '@/stores/streamerStore';
import { VotingSession, VotingOption } from '@/types/streamer.types';
import { subscribeToVotingSession } from '@/features/streamer/services/votingService';

interface VotingWidgetProps {
  sessionId: string;
  compact?: boolean;
}

/**
 * リアルタイム・ウィジェット
 * 配信画面上に投票結果をリアルタイムでオーバーレイ表示。
 * バーチャート / パイチャート切り替え対応。
 */
export const VotingWidget: React.FC<VotingWidgetProps> = ({
  sessionId,
  compact = false,
}) => {
  const { widgetConfig } = useStreamerStore();
  const [session, setSession] = useState<VotingSession | null>(null);

  // リアルタイム購読
  useEffect(() => {
    const unsubscribe = subscribeToVotingSession(sessionId, (data) => {
      setSession(data);
    });
    return () => unsubscribe();
  }, [sessionId]);

  if (!session) return null;

  const sortedOptions = [...session.options].sort((a, b) => b.voteCount - a.voteCount);
  const visibleOptions = sortedOptions.slice(0, widgetConfig.maxVisibleOptions);

  return (
    <View className={`bg-black/70 rounded-xl ${compact ? 'p-2' : 'p-4'}`}>
      {/* タイトル */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-white font-bold ${compact ? 'text-sm' : 'text-base'}`}>
          {session.title}
        </Text>
        <View className="bg-red-600 px-2 py-0.5 rounded">
          <Text className="text-white text-xs font-bold">LIVE</Text>
        </View>
      </View>

      {/* 総投票数 */}
      <Text className="text-gray-400 text-xs mb-2">
        総投票数: {session.totalVotes}
      </Text>

      {/* 投票結果 */}
      {widgetConfig.displayMode === 'bar' ? (
        <BarChartDisplay
          options={visibleOptions}
          totalVotes={session.totalVotes}
          showPercentage={widgetConfig.showPercentage}
          animated={widgetConfig.animationEnabled}
          compact={compact}
        />
      ) : (
        <PieChartDisplay
          options={visibleOptions}
          totalVotes={session.totalVotes}
          showPercentage={widgetConfig.showPercentage}
          compact={compact}
        />
      )}
    </View>
  );
};

// バーチャート表示
interface BarChartDisplayProps {
  options: VotingOption[];
  totalVotes: number;
  showPercentage: boolean;
  animated: boolean;
  compact: boolean;
}

const BAR_COLORS = [
  '#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
  '#26C6DA', '#FFCA28', '#8D6E63', '#78909C', '#EC407A',
];

const BarChartDisplay: React.FC<BarChartDisplayProps> = ({
  options,
  totalVotes,
  showPercentage,
  compact,
}) => {
  return (
    <View className="gap-1.5">
      {options.map((option, index) => {
        const percentage = totalVotes > 0
          ? Math.round((option.voteCount / totalVotes) * 100)
          : 0;
        const barColor = BAR_COLORS[index % BAR_COLORS.length];

        return (
          <View key={option.id}>
            <View className="flex-row items-center justify-between mb-0.5">
              <Text
                className={`text-white ${compact ? 'text-xs' : 'text-sm'}`}
                numberOfLines={1}
              >
                {option.label}
              </Text>
              <Text className="text-gray-400 text-xs">
                {showPercentage ? `${percentage}%` : option.voteCount}
              </Text>
            </View>
            <View className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

// パイチャート表示（簡易版：セグメントバーで表現）
interface PieChartDisplayProps {
  options: VotingOption[];
  totalVotes: number;
  showPercentage: boolean;
  compact: boolean;
}

const PieChartDisplay: React.FC<PieChartDisplayProps> = ({
  options,
  totalVotes,
  showPercentage,
  compact,
}) => {
  return (
    <View>
      {/* 積み上げバー */}
      <View className="h-6 flex-row rounded-full overflow-hidden mb-2">
        {options.map((option, index) => {
          const percentage = totalVotes > 0
            ? (option.voteCount / totalVotes) * 100
            : 0;
          if (percentage === 0) return null;

          return (
            <View
              key={option.id}
              style={{
                width: `${percentage}%`,
                backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
              }}
              className="h-full items-center justify-center"
            >
              {percentage >= 10 && (
                <Text className="text-white text-xs font-bold">
                  {Math.round(percentage)}%
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* 凡例 */}
      <View className="flex-row flex-wrap gap-2">
        {options.map((option, index) => (
          <View key={option.id} className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-1"
              style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
            />
            <Text className={`text-gray-300 ${compact ? 'text-xs' : 'text-xs'}`}>
              {option.label}
              {showPercentage &&
                ` (${totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0}%)`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// QRコード表示コンポーネント（投票URL用）
interface VotingQRCodeProps {
  votingUrl: string;
}

export const VotingQRCode: React.FC<VotingQRCodeProps> = ({ votingUrl }) => {
  return (
    <View className="items-center p-4 bg-white rounded-xl">
      <Text className="text-black text-sm font-bold mb-2">投票はこちら</Text>
      {/* QRコードはreact-native-qrcode-svg等で描画 */}
      <View className="w-32 h-32 bg-gray-200 items-center justify-center rounded">
        <Text className="text-gray-500 text-xs text-center">
          QR Code{'\n'}{votingUrl}
        </Text>
      </View>
      <Text className="text-gray-500 text-xs mt-2 text-center" numberOfLines={1}>
        {votingUrl}
      </Text>
    </View>
  );
};

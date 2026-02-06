import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Svg, Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { RadarDataPoint } from '@/types/matchup.types';

interface RadarChartViewProps {
  focusedCharacterName: string;
  data: RadarDataPoint[];
  size?: number;
  onClose?: () => void;
  onCharacterTap?: (characterId: string) => void;
}

/**
 * フォーカス・ビュー
 * 特定キャラを起点とした全方位相性図（レーダーチャート）。
 * 有利・不利の閾値でゾーン分け表示。
 */
export const RadarChartView: React.FC<RadarChartViewProps> = ({
  focusedCharacterName,
  data,
  size: propSize,
  onClose,
  onCharacterTap,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const size = propSize || Math.min(screenWidth - 32, 360);
  const center = size / 2;
  const radius = (size / 2) * 0.7; // マージン確保

  const chartData = useMemo(() => {
    if (data.length === 0) return { points: '', zonePoints: [] as string[], labels: [] as any[] };

    const angleStep = (2 * Math.PI) / data.length;

    // データポイントをポリゴン座標に変換
    const points = data
      .map((d, i) => {
        const angle = angleStep * i - Math.PI / 2; // 12時方向から開始
        const r = (d.value / 10) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

    // ゾーンライン（5=五分、7=有利境界、3=不利境界）
    const zoneRadii = [3, 5, 7, 10]; // 不利、五分、有利、最大
    const zonePoints = zoneRadii.map((zoneValue) =>
      data
        .map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (zoneValue / 10) * radius;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        })
        .join(' ')
    );

    // ラベル位置
    const labels = data.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const labelR = radius + 24;
      return {
        x: center + labelR * Math.cos(angle),
        y: center + labelR * Math.sin(angle),
        name: d.characterName,
        characterId: d.characterId,
        value: d.value,
      };
    });

    return { points, zonePoints, labels };
  }, [data, center, radius]);

  // 軸線
  const axisLines = useMemo(() => {
    if (data.length === 0) return [];
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
  }, [data, center, radius]);

  const ZONE_COLORS = ['#F4433640', '#FFFF7F20', '#4CAF5030', '#4CAF5010'];

  return (
    <View className="bg-[#1A1A1A] rounded-xl p-4">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <Text className="text-white text-lg font-bold">{focusedCharacterName}</Text>
          <Text className="text-gray-400 text-xs">全方位相性図</Text>
        </View>
        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-700 px-3 py-1.5 rounded"
          >
            <Text className="text-white text-sm">マトリックスに戻る</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* レーダーチャート */}
      <View className="items-center">
        <Svg width={size} height={size}>
          {/* ゾーンポリゴン */}
          {chartData.zonePoints.map((points, i) => (
            <Polygon
              key={`zone-${i}`}
              points={points}
              fill={ZONE_COLORS[i]}
              stroke="#333"
              strokeWidth={0.5}
            />
          ))}

          {/* 軸線 */}
          {axisLines.map((end, i) => (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#444"
              strokeWidth={0.5}
            />
          ))}

          {/* データポリゴン */}
          {chartData.points && (
            <Polygon
              points={chartData.points}
              fill="#42A5F540"
              stroke="#42A5F5"
              strokeWidth={2}
            />
          )}

          {/* データ点 */}
          {data.map((d, i) => {
            const angleStep = (2 * Math.PI) / data.length;
            const angle = angleStep * i - Math.PI / 2;
            const r = (d.value / 10) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            return (
              <Circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={d.value >= 6 ? '#4CAF50' : d.value <= 4 ? '#F44336' : '#FFC107'}
                stroke="white"
                strokeWidth={1}
              />
            );
          })}

          {/* ラベル */}
          {chartData.labels.map((label, i) => (
            <G key={`label-${i}`}>
              <SvgText
                x={label.x}
                y={label.y}
                fontSize={9}
                fill={
                  label.value >= 6 ? '#4CAF50' : label.value <= 4 ? '#F44336' : '#AAAAAA'
                }
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {label.name.length > 6 ? label.name.slice(0, 5) + '…' : label.name}
              </SvgText>
              <SvgText
                x={label.x}
                y={label.y + 12}
                fontSize={8}
                fill="#888"
                textAnchor="middle"
              >
                {label.value}:{10 - label.value}
              </SvgText>
            </G>
          ))}

          {/* 中央ラベル */}
          <SvgText
            x={center}
            y={center}
            fontSize={10}
            fill="white"
            textAnchor="middle"
            fontWeight="bold"
          >
            {focusedCharacterName}
          </SvgText>
        </Svg>
      </View>

      {/* 凡例 */}
      <View className="flex-row justify-center gap-4 mt-2">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#4CAF50] mr-1" />
          <Text className="text-gray-400 text-xs">有利 (6:4+)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#FFC107] mr-1" />
          <Text className="text-gray-400 text-xs">五分</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full bg-[#F44336] mr-1" />
          <Text className="text-gray-400 text-xs">不利 (4:6-)</Text>
        </View>
      </View>
    </View>
  );
};

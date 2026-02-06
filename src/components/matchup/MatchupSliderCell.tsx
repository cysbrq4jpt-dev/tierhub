import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';

interface MatchupSliderCellProps {
  charA: string;
  charB: string;
  charAName: string;
  charBName: string;
  currentValue: number;
  onValueChange: (value: number) => void;
  onMemoChange?: (memo: string) => void;
  onClose: () => void;
}

/**
 * 直感スライダー
 * スライダーを左右に動かすだけで「6:4」「7:3」といった数値を爆速入力。
 * 0.5刻みで入力可能。
 */
export const MatchupSliderCell: React.FC<MatchupSliderCellProps> = ({
  charA,
  charB,
  charAName,
  charBName,
  currentValue,
  onValueChange,
  onMemoChange,
  onClose,
}) => {
  const [value, setValue] = useState(currentValue);
  const [showMemo, setShowMemo] = useState(false);
  const [memo, setMemo] = useState('');

  // 0.5刻みにスナップ
  const snapToHalf = useCallback((v: number): number => {
    return Math.round(v * 2) / 2;
  }, []);

  const handleValueChange = useCallback(
    (rawValue: number) => {
      const snapped = snapToHalf(rawValue);
      setValue(snapped);
    },
    [snapToHalf]
  );

  const handleComplete = useCallback(
    (rawValue: number) => {
      const snapped = snapToHalf(rawValue);
      setValue(snapped);
      onValueChange(snapped);
    },
    [snapToHalf, onValueChange]
  );

  const getColorForValue = (v: number): string => {
    if (v >= 7) return '#1565C0';
    if (v >= 6) return '#42A5F5';
    if (v > 5) return '#90CAF9';
    if (v === 5) return '#757575';
    if (v >= 4) return '#EF9A9A';
    if (v >= 3) return '#E53935';
    return '#B71C1C';
  };

  const opponent = 10 - value;

  return (
    <View className="bg-[#1E1E1E] border-t border-gray-700 p-4">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-blue-400 font-bold text-sm">{charAName}</Text>
          <Text className="text-gray-500 mx-2">vs</Text>
          <Text className="text-red-400 font-bold text-sm">{charBName}</Text>
        </View>
        <TouchableOpacity onPress={onClose} className="px-2 py-1">
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {/* 数値表示 */}
      <View className="items-center mb-2">
        <Text
          className="text-3xl font-bold"
          style={{ color: getColorForValue(value) }}
        >
          {value} : {opponent}
        </Text>
        <Text className="text-gray-500 text-xs mt-1">
          {value > 5
            ? `${charAName} 有利`
            : value < 5
              ? `${charBName} 有利`
              : '五分'}
        </Text>
      </View>

      {/* スライダー */}
      <View className="flex-row items-center">
        <Text className="text-red-400 text-xs w-8">0</Text>
        <View className="flex-1 mx-2">
          <Slider
            value={value}
            minimumValue={0}
            maximumValue={10}
            step={0.5}
            onValueChange={handleValueChange}
            onSlidingComplete={handleComplete}
            minimumTrackTintColor="#42A5F5"
            maximumTrackTintColor="#E53935"
            thumbTintColor={getColorForValue(value)}
          />
        </View>
        <Text className="text-blue-400 text-xs w-8 text-right">10</Text>
      </View>

      {/* クイック入力ボタン */}
      <View className="flex-row justify-center gap-2 mt-3">
        {[3, 4, 4.5, 5, 5.5, 6, 7].map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => {
              setValue(v);
              onValueChange(v);
            }}
            className={`px-2 py-1 rounded ${
              value === v ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <Text className="text-white text-xs">
              {v}:{10 - v}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* メモ入力トグル */}
      <TouchableOpacity
        onPress={() => setShowMemo(!showMemo)}
        className="mt-3 py-1"
      >
        <Text className="text-blue-400 text-xs text-center">
          {showMemo ? 'メモを閉じる' : 'メモを追加'}
        </Text>
      </TouchableOpacity>

      {showMemo && (
        <TextInput
          value={memo}
          onChangeText={(text) => {
            setMemo(text);
            onMemoChange?.(text);
          }}
          placeholder="この相性の理由をメモ..."
          placeholderTextColor="#666"
          className="bg-[#2A2A2A] text-white rounded p-2 mt-1 text-sm"
          multiline
          numberOfLines={2}
        />
      )}
    </View>
  );
};

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MatchupSliderCell } from './MatchupSliderCell';
import { useMatchupEditorStore } from '@/stores/matchupStore';
import { getMatchupValue } from '@/types/matchup.types';

interface MatchupMatrixProps {
  characterNames: Record<string, string>; // id -> name
  editable?: boolean;
  onCharacterFocus?: (characterId: string) => void;
}

/**
 * ダイナミック・マトリックス
 * 総当たり相性表を表示。各セルはタップでスライダー入力。
 */
export const MatchupMatrix: React.FC<MatchupMatrixProps> = ({
  characterNames,
  editable = false,
  onCharacterFocus,
}) => {
  const { characters, cells, setCellValue, setCellMemo } = useMatchupEditorStore();
  const [activeCell, setActiveCell] = useState<{ a: string; b: string } | null>(null);

  const getCellColor = useCallback((value: number): string => {
    // 5 = 五分（灰色）、値が高いほど青（有利）、低いほど赤（不利）
    if (value >= 7) return '#1565C0'; // 大幅有利
    if (value >= 6) return '#42A5F5'; // 有利
    if (value >= 5.5) return '#90CAF9'; // やや有利
    if (value > 4.5) return '#424242'; // 五分
    if (value >= 4) return '#EF9A9A'; // やや不利
    if (value >= 3) return '#E53935'; // 不利
    return '#B71C1C'; // 大幅不利
  }, []);

  const formatValue = useCallback((value: number): string => {
    const opponent = 10 - value;
    return `${value}:${opponent}`;
  }, []);

  const handleCellPress = useCallback(
    (charA: string, charB: string) => {
      if (!editable || charA === charB) return;
      setActiveCell({ a: charA, b: charB });
    },
    [editable]
  );

  const CELL_SIZE = 48;
  const HEADER_SIZE = 56;

  return (
    <View className="flex-1 bg-[#121212]">
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <ScrollView showsVerticalScrollIndicator={true}>
          <View>
            {/* ヘッダー行 */}
            <View className="flex-row">
              {/* 左上空白セル */}
              <View
                style={{ width: HEADER_SIZE, height: HEADER_SIZE }}
                className="bg-[#1A1A1A] border border-gray-800 items-center justify-center"
              >
                <Text className="text-gray-500 text-xs">vs</Text>
              </View>
              {/* 列ヘッダー */}
              {characters.map((charId) => (
                <TouchableOpacity
                  key={`h-${charId}`}
                  style={{ width: CELL_SIZE, height: HEADER_SIZE }}
                  className="bg-[#1A1A1A] border border-gray-800 items-center justify-center p-0.5"
                  onPress={() => onCharacterFocus?.(charId)}
                >
                  <Text
                    className="text-white text-xs text-center font-medium"
                    numberOfLines={2}
                  >
                    {characterNames[charId] || charId.slice(0, 4)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* データ行 */}
            {characters.map((rowChar) => (
              <View key={`r-${rowChar}`} className="flex-row">
                {/* 行ヘッダー */}
                <TouchableOpacity
                  style={{ width: HEADER_SIZE, height: CELL_SIZE }}
                  className="bg-[#1A1A1A] border border-gray-800 items-center justify-center p-0.5"
                  onPress={() => onCharacterFocus?.(rowChar)}
                >
                  <Text
                    className="text-white text-xs text-center font-medium"
                    numberOfLines={2}
                  >
                    {characterNames[rowChar] || rowChar.slice(0, 4)}
                  </Text>
                </TouchableOpacity>

                {/* セル */}
                {characters.map((colChar) => {
                  const value = getMatchupValue(cells, rowChar, colChar);
                  const isSelf = rowChar === colChar;
                  const isActive =
                    activeCell?.a === rowChar && activeCell?.b === colChar;

                  return (
                    <TouchableOpacity
                      key={`c-${rowChar}-${colChar}`}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: isSelf ? '#1A1A1A' : getCellColor(value),
                      }}
                      className={`border border-gray-800/50 items-center justify-center ${
                        isActive ? 'border-2 border-yellow-400' : ''
                      }`}
                      onPress={() => handleCellPress(rowChar, colChar)}
                      disabled={isSelf}
                    >
                      {isSelf ? (
                        <Text className="text-gray-600 text-xs">—</Text>
                      ) : (
                        <Text className="text-white text-xs font-bold">
                          {formatValue(value)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* アクティブセルのスライダー入力 */}
      {activeCell && editable && (
        <MatchupSliderCell
          charA={activeCell.a}
          charB={activeCell.b}
          charAName={characterNames[activeCell.a] || '???'}
          charBName={characterNames[activeCell.b] || '???'}
          currentValue={getMatchupValue(cells, activeCell.a, activeCell.b)}
          onValueChange={(value) => setCellValue(activeCell.a, activeCell.b, value)}
          onMemoChange={(memo) => setCellMemo(activeCell.a, activeCell.b, memo)}
          onClose={() => setActiveCell(null)}
        />
      )}
    </View>
  );
};

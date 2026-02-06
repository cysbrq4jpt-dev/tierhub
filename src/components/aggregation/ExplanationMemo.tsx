import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface ExplanationMemoProps {
  itemId: string;
  itemName: string;
  currentTier: string;
  explanation: string;
  onSave: (itemId: string, explanation: string) => void;
  editable?: boolean;
}

/**
 * 解説メモ
 * キャラごとの配置理由をテキスト保存。
 * Tier表の各アイテムに解説を添付可能。
 */
export const ExplanationMemo: React.FC<ExplanationMemoProps> = ({
  itemId,
  itemName,
  currentTier,
  explanation,
  onSave,
  editable = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(explanation);

  const handleSave = useCallback(() => {
    onSave(itemId, text);
    setIsEditing(false);
  }, [itemId, text, onSave]);

  return (
    <View className="bg-[#2A2A2A] rounded-lg p-3 mb-2">
      {/* ヘッダー */}
      <View className="flex-row items-center mb-1">
        <Text className="text-white text-sm font-bold flex-1">
          {itemName}
        </Text>
        <View className="bg-gray-700 px-2 py-0.5 rounded">
          <Text className="text-gray-300 text-xs">{currentTier}ランク</Text>
        </View>
      </View>

      {/* 解説テキスト */}
      {isEditing ? (
        <View>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="このキャラをこのTierに置いた理由..."
            placeholderTextColor="#666"
            className="bg-[#1E1E1E] text-white rounded p-2 text-sm"
            multiline
            numberOfLines={3}
            autoFocus
          />
          <View className="flex-row justify-end gap-2 mt-2">
            <TouchableOpacity
              onPress={() => {
                setText(explanation);
                setIsEditing(false);
              }}
              className="px-3 py-1 rounded bg-gray-700"
            >
              <Text className="text-gray-300 text-xs">キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              className="px-3 py-1 rounded bg-blue-600"
            >
              <Text className="text-white text-xs">保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => editable && setIsEditing(true)}
          disabled={!editable}
        >
          {explanation ? (
            <Text className="text-gray-300 text-xs leading-4">{explanation}</Text>
          ) : (
            <Text className="text-gray-600 text-xs italic">
              {editable ? 'タップして解説を追加...' : '解説なし'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

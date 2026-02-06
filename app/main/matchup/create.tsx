import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMatchupEditorStore } from '@/stores/matchupStore';
import { useAuthStore } from '@/stores/authStore';
import { MatchupMatrix } from '@/components/matchup/MatchupMatrix';
import { RadarChartView } from '@/components/matchup/RadarChartView';
import { getMatchupValue } from '@/types/matchup.types';
import { createMatchupTable } from '@/features/matchup/services/matchupService';

export default function CreateMatchupTable() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    title,
    setTitle,
    description,
    setDescription,
    patchVersion,
    setPatchVersion,
    characters,
    cells,
    addCharacter,
    focusedCharacterId,
    setFocusedCharacter,
    resetEditor,
  } = useMatchupEditorStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingChar, setIsAddingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'radar'>('matrix');

  // キャラ名マップ（簡易版：IDをそのまま名前として使用）
  const [characterNames, setCharacterNames] = useState<Record<string, string>>({});

  const handleAddCharacter = useCallback(() => {
    if (!newCharName.trim()) return;
    const id = `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    addCharacter(id);
    setCharacterNames((prev) => ({ ...prev, [id]: newCharName.trim() }));
    setNewCharName('');
    setIsAddingChar(false);
  }, [newCharName, addCharacter]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    if (characters.length < 2) {
      Alert.alert('エラー', '2キャラ以上を追加してください');
      return;
    }

    setIsSaving(true);
    try {
      await createMatchupTable(user.id, {
        categoryId: 'general',
        title: title.trim(),
        description: description.trim(),
        patchVersion: patchVersion.trim() || 'N/A',
        characters,
        cells,
        isPublic: true,
      });
      resetEditor();
      router.push('/main/tabs');
    } catch (error) {
      Alert.alert('エラー', '相性表の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  }, [user, title, description, patchVersion, characters, cells, resetEditor, router]);

  // レーダーチャート用データ
  const radarData = focusedCharacterId
    ? characters
        .filter((id) => id !== focusedCharacterId)
        .map((id) => ({
          characterId: id,
          characterName: characterNames[id] || id,
          value: getMatchupValue(cells, focusedCharacterId, id),
        }))
    : [];

  const handleCharacterFocus = useCallback(
    (charId: string) => {
      setFocusedCharacter(charId);
      setViewMode('radar');
    },
    [setFocusedCharacter]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
            <Text className="text-blue-500 text-base font-semibold">キャンセル</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">相性表作成</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
              <ActivityIndicator color="#2196F3" size="small" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  title.trim() ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                保存
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 入力エリア */}
        <View className="p-4 border-b border-gray-800">
          <TextInput
            className="bg-[#1E1E1E] text-white p-3 rounded-lg text-base"
            placeholder="相性表のタイトル"
            placeholderTextColor="#9E9E9E"
            value={title}
            onChangeText={setTitle}
          />
          <View className="flex-row gap-2 mt-2">
            <TextInput
              className="flex-1 bg-[#1E1E1E] text-white p-3 rounded-lg text-sm"
              placeholder="パッチバージョン"
              placeholderTextColor="#9E9E9E"
              value={patchVersion}
              onChangeText={setPatchVersion}
            />
            <TextInput
              className="flex-1 bg-[#1E1E1E] text-white p-3 rounded-lg text-sm"
              placeholder="説明（オプション）"
              placeholderTextColor="#9E9E9E"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* ビューモード切り替え */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-800">
          <View className="flex-row gap-2">
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
          <Text className="text-gray-400 text-xs">{characters.length} キャラ</Text>
        </View>

        {/* メインコンテンツ */}
        <View className="flex-1">
          {viewMode === 'matrix' ? (
            <MatchupMatrix
              characterNames={characterNames}
              editable
              onCharacterFocus={handleCharacterFocus}
            />
          ) : focusedCharacterId ? (
            <RadarChartView
              focusedCharacterName={characterNames[focusedCharacterId] || '???'}
              data={radarData}
              onClose={() => setViewMode('matrix')}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500">
                マトリックスからキャラを選択してください
              </Text>
            </View>
          )}
        </View>

        {/* キャラ追加バー */}
        <View className="border-t border-gray-800 bg-[#1E1E1E] p-3">
          {isAddingChar ? (
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-[#121212] text-white p-2 rounded"
                placeholder="キャラクター名"
                placeholderTextColor="#9E9E9E"
                value={newCharName}
                onChangeText={setNewCharName}
                onSubmitEditing={handleAddCharacter}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddCharacter}
                className="bg-blue-600 px-4 justify-center rounded"
              >
                <Text className="text-white font-semibold">追加</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsAddingChar(false)}
                className="px-2 justify-center"
              >
                <Text className="text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsAddingChar(true)}
              className="bg-blue-600 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-bold">＋ キャラクターを追加</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

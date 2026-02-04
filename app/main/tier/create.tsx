import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTierEditorStore } from '@/stores/tierStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateTierList } from '@/features/tier/hooks/useTierList';
import { TierBoard, TierBoardRef } from '@/components/tier/TierBoard';
import { TierItem as TierItemComponent } from '@/components/tier/TierItem';
import { uploadTierItemImage } from '@/services/firebase/storage';
import { TierItem } from '@/types/tier.types';

export default function CreateTierList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    title,
    setTitle,
    description,
    setDescription,
    pool,
    tiers,
    resetEditor,
    addItemToPool,
    moveItem,
  } = useTierEditorStore();
  const createTierList = useCreateTierList();

  const tierBoardRef = useRef<TierBoardRef>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Firestore に保存
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await createTierList.mutateAsync({
        categoryId: 'general', // カテゴリ機能実装時に動的にする
        title: title.trim(),
        description: description.trim(),
        tiers,
        isPublic: true,
      });
      resetEditor();
      router.push('/main/tabs');
    } catch (error) {
      Alert.alert('エラー', 'TIER表の保存に失敗しました。再試行してください。');
    } finally {
      setIsSaving(false);
    }
  }, [title, description, tiers, createTierList, resetEditor, router]);

  // テキストアイテム追加
  const handleAddItem = useCallback(() => {
    if (!newItemLabel.trim()) return;

    addItemToPool({
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      tierListId: '',
      tier: 'pool' as any,
      order: pool.length,
      customLabel: newItemLabel.trim(),
      customImageUrl: null,
      masterItemId: null,
    });
    setNewItemLabel('');
    setIsAddingItem(false);
  }, [newItemLabel, addItemToPool, pool.length]);

  // 画像アイテム追加
  const handleAddImageItem = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const label = newItemLabel.trim() || `アイテム${pool.length + 1}`;
        const itemId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        addItemToPool({
          id: itemId,
          tierListId: '',
          tier: 'pool' as any,
          order: pool.length,
          customLabel: label,
          customImageUrl: imageUri,
          masterItemId: null,
        });

        setNewItemLabel('');
        setIsAddingItem(false);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の読み込みに失敗しました');
    }
  }, [newItemLabel, addItemToPool, pool.length]);

  // プール内アイテムの長押し → TierBoard の選択インフォバーに連携
  const handlePoolItemLongPress = useCallback((item: TierItem) => {
    tierBoardRef.current?.selectItem(item, 'pool');
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
            <Text className="text-primary-500 text-base font-semibold">キャンセル</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">TIER表作成</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? (
              <ActivityIndicator color="#2196F3" size="small" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  title.trim() ? 'text-primary-500' : 'text-gray-600'
                }`}
              >
                保存
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View className="p-4 border-b border-gray-800">
          <TextInput
            className="bg-[#1E1E1E] text-white p-3 rounded-lg text-base"
            placeholder="TIER表のタイトル"
            placeholderTextColor="#9E9E9E"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            className="bg-[#1E1E1E] text-white p-3 rounded-lg mt-2 text-sm"
            placeholder="説明（オプション）"
            placeholderTextColor="#9E9E9E"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Tier Board */}
        <View className="flex-1">
          <TierBoard ref={tierBoardRef} editable />
        </View>

        {/* Item Pool */}
        <View className="border-t border-gray-800 bg-[#1E1E1E] p-2" style={{ minHeight: 120 }}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-semibold">
              アイテムプール{pool.length > 0 ? ` (${pool.length})` : ''}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleAddImageItem}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                <Text className="text-white text-sm">📷 画像</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsAddingItem(!isAddingItem)}
                className="bg-primary-500 px-3 py-1 rounded"
              >
                <Text className="text-white text-sm">＋ テキスト</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* テキスト入力フォーム */}
          {isAddingItem && (
            <View className="flex-row gap-2 mb-2">
              <TextInput
                className="flex-1 bg-[#121212] text-white p-2 rounded"
                placeholder="アイテム名"
                placeholderTextColor="#9E9E9E"
                value={newItemLabel}
                onChangeText={setNewItemLabel}
                onSubmitEditing={handleAddItem}
                autoFocus
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddItem}
                className="bg-primary-500 px-4 justify-center rounded"
              >
                <Text className="text-white font-semibold">追加</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pool アイテム表示 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-1 items-center">
              {pool.length > 0 ? (
                pool.map((item) => (
                  <TierItemComponent
                    key={item.id}
                    item={item}
                    onLongPress={() => handlePoolItemLongPress(item)}
                  />
                ))
              ) : (
                <View className="px-4 py-2">
                  <Text className="text-gray-600 text-xs">
                    アイテムを追加してから、TIERラベルにタップして移動してください
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

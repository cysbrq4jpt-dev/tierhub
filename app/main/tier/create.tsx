import { useState, useCallback, useRef, useEffect } from 'react';
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
import { CategorySelector } from '@/components/category/CategorySelector';
import { useCategory } from '@/features/category/hooks/useCategories';
import { uploadTierItemImage } from '@/services/firebase/storage';
import { TierItem } from '@/types/tier.types';

const CATEGORY_ICONS: Record<string, string> = {
  general: '📊',
  games: '🎮',
  anime: '🎌',
  movies: '🎬',
  music: '🎵',
  food: '🍽️',
  sports: '⚽',
  travel: '✈️',
  books: '📚',
  tech: '💻',
};

export default function CreateTierList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    categoryId,
    title,
    setTitle,
    description,
    setDescription,
    pool,
    tiers,
    resetEditor,
    initializeEditor,
    addItemToPool,
    moveItem,
  } = useTierEditorStore();
  const createTierList = useCreateTierList();

  const tierBoardRef = useRef<TierBoardRef>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // カテゴリー情報を取得
  const { data: selectedCategory } = useCategory(categoryId || '');

  // 初回マウント時にデフォルトカテゴリーを設定
  useEffect(() => {
    if (!categoryId) {
      initializeEditor('general');
    }
  }, [categoryId, initializeEditor]);

  // カテゴリー選択ハンドラー
  const handleCategorySelect = useCallback(
    (newCategoryId: string) => {
      initializeEditor(newCategoryId);
    },
    [initializeEditor]
  );

  // Firestore に保存
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    if (!categoryId) {
      Alert.alert('エラー', 'カテゴリーを選択してください');
      return;
    }

    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が取得できませんでした');
      return;
    }

    setIsSaving(true);
    try {
      // 一時IDを生成（画像アップロード用）
      const tempTierListId = `temp_${Date.now()}`;

      // ローカル画像URIをFirebase Storageにアップロード
      const tiersWithUploadedImages = { ...tiers };
      for (const tierRank of Object.keys(tiersWithUploadedImages)) {
        const items = tiersWithUploadedImages[tierRank];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          // ローカル画像URI（file://またはローカルパス）をチェック
          if (item.customImageUrl && item.customImageUrl.startsWith('file://')) {
            try {
              const uploadedUrl = await uploadTierItemImage(
                user.id,
                tempTierListId,
                item.id,
                item.customImageUrl
              );
              items[i] = { ...item, customImageUrl: uploadedUrl };
            } catch (uploadError) {
              console.error('Image upload failed for item:', item.id, uploadError);
              // 画像アップロードに失敗した場合は画像なしで続行
              items[i] = { ...item, customImageUrl: null };
            }
          }
        }
      }

      await createTierList.mutateAsync({
        categoryId,
        title: title.trim(),
        description: description.trim(),
        tiers: tiersWithUploadedImages,
        isPublic: true,
      });
      resetEditor();
      router.push('/main/tabs');
    } catch (error) {
      console.error('Save failed:', error);
      Alert.alert('エラー', 'TIER表の保存に失敗しました。再試行してください。');
    } finally {
      setIsSaving(false);
    }
  }, [title, description, tiers, categoryId, user, createTierList, resetEditor, router]);

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

        {/* Category Selector */}
        <TouchableOpacity
          onPress={() => setShowCategorySelector(true)}
          className="mx-4 mt-4 bg-[#1E1E1E] p-3 rounded-lg flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl">
              {selectedCategory ? CATEGORY_ICONS[selectedCategory.id] || '📂' : '📂'}
            </Text>
            <View>
              <Text className="text-gray-500 text-xs">カテゴリー</Text>
              <Text className="text-white font-semibold">
                {selectedCategory?.name || 'カテゴリーを選択'}
              </Text>
            </View>
          </View>
          <Text className="text-gray-500">›</Text>
        </TouchableOpacity>

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

      {/* Category Selector Modal */}
      <CategorySelector
        visible={showCategorySelector}
        selectedCategoryId={categoryId}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategorySelector(false)}
      />
    </KeyboardAvoidingView>
  );
}

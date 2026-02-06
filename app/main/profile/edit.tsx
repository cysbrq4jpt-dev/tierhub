import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateUserProfile } from '@/features/user/hooks/useUser';
import { Avatar } from '@/components/common/Avatar';
import { uploadProfileImage } from '@/services/firebase/storage';
import { handleError } from '@/utils/errorHandling';

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuthStore();
  const updateUserProfile = useUpdateUserProfile();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 画像選択
  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setIsUploading(true);

        try {
          // Firebase Storageにアップロード
          const uploadedUrl = await uploadProfileImage(user!.id, localUri);
          setPhotoURL(uploadedUrl);
        } catch (error) {
          const errorInfo = handleError(error, 'Profile Image Upload');
          Alert.alert(errorInfo.title, errorInfo.message);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      const errorInfo = handleError(error, 'Image Picker');
      Alert.alert(errorInfo.title, errorInfo.message);
    }
  }, [user]);

  // 保存
  const handleSave = useCallback(async () => {
    if (!displayName.trim()) {
      Alert.alert('エラー', '表示名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL,
      });
      Alert.alert('成功', 'プロフィールを更新しました', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      const errorInfo = handleError(error, 'Profile Update');
      Alert.alert(errorInfo.title, errorInfo.message);
    } finally {
      setIsSaving(false);
    }
  }, [displayName, bio, photoURL, updateUserProfile, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()} disabled={isSaving}>
          <Text className="text-gray-400 text-base">キャンセル</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">プロフィール編集</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving || isUploading}>
          {isSaving ? (
            <ActivityIndicator color="#2196F3" size="small" />
          ) : (
            <Text className="text-primary-500 text-base font-semibold">保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* プロフィール画像 */}
        <View className="items-center py-6">
          <View className="relative">
            <Avatar uri={photoURL} name={displayName} size={100} />
            {isUploading && (
              <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isUploading}
            className="mt-3"
          >
            <Text className="text-primary-500 text-sm font-semibold">
              {isUploading ? 'アップロード中...' : '写真を変更'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* フォーム */}
        <View className="px-4">
          {/* 表示名 */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1">表示名</Text>
            <TextInput
              className="bg-[#1E1E1E] text-white p-3 rounded-lg text-base"
              placeholder="表示名を入力"
              placeholderTextColor="#9E9E9E"
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={50}
            />
            <Text className="text-gray-600 text-xs mt-1">
              {displayName.length}/50
            </Text>
          </View>

          {/* 自己紹介 */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1">自己紹介</Text>
            <TextInput
              className="bg-[#1E1E1E] text-white p-3 rounded-lg text-base"
              placeholder="自己紹介を入力"
              placeholderTextColor="#9E9E9E"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text className="text-gray-600 text-xs mt-1">
              {bio.length}/200
            </Text>
          </View>

          {/* メールアドレス（編集不可） */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1">メールアドレス</Text>
            <View className="bg-[#1A1A1A] p-3 rounded-lg">
              <Text className="text-gray-500 text-base">{user?.email}</Text>
            </View>
            <Text className="text-gray-600 text-xs mt-1">
              メールアドレスは変更できません
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

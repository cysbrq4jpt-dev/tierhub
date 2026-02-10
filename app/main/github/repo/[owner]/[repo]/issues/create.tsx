import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCreateIssue } from '@/features/github';
import { Button } from '@/components/common/Button';

export default function CreateIssue() {
  const router = useRouter();
  const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const createIssue = useCreateIssue();

  const handleSubmit = async () => {
    if (!title.trim() || !owner || !repo) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    try {
      const issue = await createIssue.mutateAsync({
        owner,
        repo,
        title: title.trim(),
        body: body.trim() || undefined,
      });
      router.replace(`/main/github/repo/${owner}/${repo}/issues/${issue.number}`);
    } catch (error) {
      console.error('Failed to create issue:', error);
      Alert.alert('エラー', 'Issueの作成に失敗しました');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      <View className="p-4 border-b border-gray-800 flex-row items-center justify-between">
        <View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-400">← Cancel</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white mt-2">New Issue</Text>
          <Text className="text-gray-500 text-sm">{owner}/{repo}</Text>
        </View>
        <Button
          title="作成"
          onPress={handleSubmit}
          disabled={!title.trim() || createIssue.isPending}
          loading={createIssue.isPending}
          size="small"
        />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">タイトル *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Issue タイトル"
            placeholderTextColor="#666"
            className="bg-gray-900 text-white p-4 rounded-lg"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm mb-2">説明（任意）</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="詳細な説明を入力..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            className="bg-gray-900 text-white p-4 rounded-lg min-h-[200px]"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

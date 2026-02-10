import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/common/Card';

export default function RepoIndex() {
  const router = useRouter();
  const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();

  return (
    <View className="flex-1 bg-[#121212]">
      <View className="p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-400">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white mt-2">{repo}</Text>
        <Text className="text-gray-500 text-sm">{owner}/{repo}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card
          onPress={() => router.push(`/main/github/repo/${owner}/${repo}/issues`)}
          style={{ marginBottom: 12 }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-green-900 rounded-full justify-center items-center">
              <Text className="text-2xl">📋</Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white font-semibold text-lg">Issues</Text>
              <Text className="text-gray-500 text-sm">バグ報告や機能リクエストを管理</Text>
            </View>
            <Text className="text-gray-500">→</Text>
          </View>
        </Card>

        <Card
          onPress={() => router.push(`/main/github/repo/${owner}/${repo}/prs`)}
          style={{ marginBottom: 12 }}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-purple-900 rounded-full justify-center items-center">
              <Text className="text-2xl">🔀</Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-white font-semibold text-lg">Pull Requests</Text>
              <Text className="text-gray-500 text-sm">コード変更のレビューとマージ</Text>
            </View>
            <Text className="text-gray-500">→</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

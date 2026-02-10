import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGitHubAuth, useUserRepositories } from '@/features/github';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { GitHubRepository } from '@/services/github/api';

export default function GitHubIndex() {
  const router = useRouter();
  const { isConnected, user, isLoading: authLoading, connectGitHub, disconnectGitHub, canConnect } = useGitHubAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserRepositories();

  const repositories: GitHubRepository[] = data?.pages.flatMap((page) => page) || [];

  // Not connected to GitHub
  if (!isConnected) {
    return (
      <View className="flex-1 bg-[#121212]">
        <View className="p-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-400">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white mt-2">GitHub</Text>
        </View>
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-gray-700 rounded-full justify-center items-center mb-4">
            <Text className="text-3xl">🐙</Text>
          </View>
          <Text className="text-white text-xl font-bold">GitHubと接続</Text>
          <Text className="text-gray-500 text-sm mt-2 text-center">
            GitHubアカウントを接続してIssueやPull Requestを管理しましょう
          </Text>
          <Button
            title={authLoading ? '接続中...' : 'GitHubに接続'}
            onPress={connectGitHub}
            loading={authLoading}
            disabled={!canConnect || authLoading}
            fullWidth
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  const renderRepoItem = ({ item }: { item: GitHubRepository }) => (
    <Card
      onPress={() => router.push(`/main/github/repo/${item.owner.login}/${item.name}`)}
      style={{ marginHorizontal: 16 }}
    >
      <View className="flex-row items-center">
        <Avatar uri={item.owner.avatar_url} name={item.owner.login} size={40} />
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">{item.name}</Text>
          <Text className="text-gray-500 text-xs">{item.full_name}</Text>
        </View>
        {item.private && (
          <View className="bg-gray-700 px-2 py-1 rounded">
            <Text className="text-gray-400 text-xs">Private</Text>
          </View>
        )}
      </View>
      {item.description && (
        <Text className="text-gray-400 text-sm mt-2" numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View className="flex-row mt-3 gap-4">
        {item.language && (
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-blue-400 mr-1" />
            <Text className="text-gray-500 text-xs">{item.language}</Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-xs">⭐ {item.stargazers_count}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-xs">🔀 {item.forks_count}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-xs">⚠️ {item.open_issues_count}</Text>
        </View>
      </View>
    </Card>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-8">
      <Text className="text-gray-500 text-sm">リポジトリがありません</Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 py-4">
      <View className="flex-row items-center">
        <Avatar uri={user?.avatar_url} name={user?.login} size={48} />
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold text-lg">{user?.name || user?.login}</Text>
          <Text className="text-gray-500 text-sm">@{user?.login}</Text>
        </View>
        <TouchableOpacity onPress={disconnectGitHub}>
          <Text className="text-red-400 text-sm">切断</Text>
        </TouchableOpacity>
      </View>
      <View className="border-t border-gray-800 mt-4 pt-4">
        <Text className="text-gray-500 text-sm font-semibold">リポジトリ一覧</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      <View className="p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-400">← Back</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white mt-2">GitHub</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={repositories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRepoItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          className="flex-1"
        />
      )}
    </View>
  );
}

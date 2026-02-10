import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRepositoryIssues } from '@/features/github';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GitHubIssue } from '@/services/github/api';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

type IssueState = 'open' | 'closed' | 'all';

export default function IssuesList() {
  const router = useRouter();
  const { owner, repo } = useLocalSearchParams<{ owner: string; repo: string }>();
  const [state, setState] = useState<IssueState>('open');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepositoryIssues({
    owner: owner || '',
    repo: repo || '',
    state,
  });

  const issues: GitHubIssue[] = data?.pages.flatMap((page) => page) || [];

  const renderIssueItem = ({ item }: { item: GitHubIssue }) => (
    <Card
      onPress={() => router.push(`/main/github/repo/${owner}/${repo}/issues/${item.number}`)}
      style={{ marginHorizontal: 16 }}
    >
      <View className="flex-row items-start">
        <View className={`w-6 h-6 rounded-full justify-center items-center mr-3 ${item.state === 'open' ? 'bg-green-900' : 'bg-purple-900'}`}>
          <Text className="text-xs">{item.state === 'open' ? '🟢' : '🟣'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white font-semibold" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            #{item.number} opened {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ja })} by {item.user.login}
          </Text>
          {item.labels.length > 0 && (
            <View className="flex-row flex-wrap mt-2 gap-1">
              {item.labels.slice(0, 3).map((label) => (
                <View
                  key={label.id}
                  style={{ backgroundColor: `#${label.color}20` }}
                  className="px-2 py-0.5 rounded"
                >
                  <Text style={{ color: `#${label.color}` }} className="text-xs">
                    {label.name}
                  </Text>
                </View>
              ))}
              {item.labels.length > 3 && (
                <Text className="text-gray-500 text-xs">+{item.labels.length - 3}</Text>
              )}
            </View>
          )}
          <View className="flex-row items-center mt-2 gap-3">
            {item.comments > 0 && (
              <Text className="text-gray-500 text-xs">💬 {item.comments}</Text>
            )}
            {item.assignees.length > 0 && (
              <View className="flex-row items-center">
                {item.assignees.slice(0, 3).map((assignee, i) => (
                  <Avatar
                    key={assignee.login}
                    uri={assignee.avatar_url}
                    name={assignee.login}
                    size={20}
                    style={{ marginLeft: i > 0 ? -8 : 0 }}
                  />
                ))}
              </View>
            )}
          </View>
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
      <Text className="text-gray-500 text-sm">Issueがありません</Text>
    </View>
  );

  const renderHeader = () => (
    <View className="px-4 py-4">
      <View className="flex-row gap-2">
        {(['open', 'closed', 'all'] as const).map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setState(s)}
            className={`px-4 py-2 rounded-full ${state === s ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            <Text className={`text-sm ${state === s ? 'text-white font-semibold' : 'text-gray-400'}`}>
              {s === 'open' ? 'Open' : s === 'closed' ? 'Closed' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      <View className="p-4 border-b border-gray-800 flex-row items-center justify-between">
        <View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-400">← Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white mt-2">Issues</Text>
          <Text className="text-gray-500 text-sm">{owner}/{repo}</Text>
        </View>
        <Button
          title="+ New"
          onPress={() => router.push(`/main/github/repo/${owner}/${repo}/issues/create`)}
          size="small"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={issues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderIssueItem}
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

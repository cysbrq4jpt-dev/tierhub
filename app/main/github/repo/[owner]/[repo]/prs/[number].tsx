import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePullRequest, usePullRequestComments, useCreateIssueComment } from '@/features/github';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GitHubComment } from '@/services/github/api';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function PRDetail() {
  const router = useRouter();
  const { owner, repo, number } = useLocalSearchParams<{ owner: string; repo: string; number: string }>();
  const prNumber = parseInt(number || '0', 10);
  const [commentText, setCommentText] = useState('');

  const { data: pr, isLoading: prLoading } = usePullRequest({
    owner: owner || '',
    repo: repo || '',
    prNumber,
  });

  const { data: commentsData, isLoading: commentsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePullRequestComments({
    owner: owner || '',
    repo: repo || '',
    prNumber,
  });

  const createComment = useCreateIssueComment();

  const comments: GitHubComment[] = commentsData?.pages.flatMap((page) => page) || [];

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !owner || !repo) return;

    try {
      await createComment.mutateAsync({
        owner,
        repo,
        issueNumber: prNumber,
        body: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleOpenInBrowser = () => {
    if (pr?.html_url) {
      Linking.openURL(pr.html_url);
    }
  };

  const renderCommentItem = ({ item }: { item: GitHubComment }) => (
    <Card style={{ marginHorizontal: 16, marginBottom: 8 }}>
      <View className="flex-row items-start">
        <Avatar uri={item.user.avatar_url} name={item.user.login} size={32} />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-semibold text-sm">{item.user.login}</Text>
            <Text className="text-gray-500 text-xs">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ja })}
            </Text>
          </View>
          <Text className="text-gray-300 text-sm mt-2">{item.body}</Text>
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
      <Text className="text-gray-500 text-sm">コメントがありません</Text>
    </View>
  );

  const renderHeader = () => {
    if (!pr) return null;

    const getStatusColor = () => {
      if (pr.merged) return 'bg-purple-900';
      if (pr.state === 'open') return 'bg-green-900';
      return 'bg-red-900';
    };

    const getStatusText = () => {
      if (pr.merged) return '🟣 Merged';
      if (pr.state === 'open') return '🟢 Open';
      return '🔴 Closed';
    };

    const getStatusTextColor = () => {
      if (pr.merged) return 'text-purple-400';
      if (pr.state === 'open') return 'text-green-400';
      return 'text-red-400';
    };

    return (
      <View className="p-4">
        <View className="flex-row items-center mb-2 justify-between">
          <View className={`px-3 py-1 rounded-full ${getStatusColor()}`}>
            <Text className={`text-sm ${getStatusTextColor()}`}>
              {getStatusText()}
            </Text>
          </View>
          <TouchableOpacity onPress={handleOpenInBrowser}>
            <Text className="text-blue-400 text-sm">GitHubで開く ↗</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-xl font-bold">{pr.title}</Text>

        <View className="flex-row items-center mt-2 gap-2">
          <Avatar uri={pr.user.avatar_url} name={pr.user.login} size={20} />
          <Text className="text-gray-500 text-sm">
            {pr.user.login} opened {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true, locale: ja })}
          </Text>
        </View>

        <View className="bg-gray-900 p-3 rounded-lg mt-4">
          <Text className="text-gray-400 text-sm">
            <Text className="text-blue-400">{pr.head.ref}</Text>
            <Text> → </Text>
            <Text className="text-blue-400">{pr.base.ref}</Text>
          </Text>
        </View>

        <View className="flex-row mt-4 gap-4">
          <View className="bg-gray-900 px-3 py-2 rounded-lg flex-row items-center">
            <Text className="text-green-400 font-semibold">+{pr.additions}</Text>
            <Text className="text-gray-500 mx-1">/</Text>
            <Text className="text-red-400 font-semibold">-{pr.deletions}</Text>
          </View>
          <View className="bg-gray-900 px-3 py-2 rounded-lg">
            <Text className="text-gray-400">{pr.changed_files} files</Text>
          </View>
          <View className="bg-gray-900 px-3 py-2 rounded-lg">
            <Text className="text-gray-400">{pr.commits} commits</Text>
          </View>
        </View>

        {pr.labels.length > 0 && (
          <View className="flex-row flex-wrap mt-3 gap-1">
            {pr.labels.map((label) => (
              <View
                key={label.id}
                style={{ backgroundColor: `#${label.color}30` }}
                className="px-2 py-1 rounded"
              >
                <Text style={{ color: `#${label.color}` }} className="text-xs">
                  {label.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {pr.body && (
          <View className="mt-4 p-4 bg-gray-900 rounded-lg">
            <Text className="text-gray-300">{pr.body}</Text>
          </View>
        )}

        <View className="border-t border-gray-800 mt-4 pt-4">
          <Text className="text-gray-500 text-sm font-semibold">
            コメント ({pr.comments})
          </Text>
        </View>
      </View>
    );
  };

  if (prLoading) {
    return (
      <View className="flex-1 bg-[#121212] justify-center items-center">
        <ActivityIndicator color="#2196F3" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      <View className="p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-400">← Back</Text>
        </TouchableOpacity>
        <Text className="text-gray-500 text-sm mt-2">#{number} · {owner}/{repo}</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCommentItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={commentsLoading ? null : renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        className="flex-1"
      />

      <View className="p-4 border-t border-gray-800">
        <View className="flex-row items-end gap-2">
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="コメントを入力..."
            placeholderTextColor="#666"
            multiline
            className="flex-1 bg-gray-900 text-white p-3 rounded-lg max-h-24"
          />
          <Button
            title="送信"
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || createComment.isPending}
            loading={createComment.isPending}
            size="small"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

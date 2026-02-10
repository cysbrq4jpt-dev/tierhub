import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useIssue, useIssueComments, useCreateIssueComment, useUpdateIssue } from '@/features/github';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GitHubComment } from '@/services/github/api';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function IssueDetail() {
  const router = useRouter();
  const { owner, repo, number } = useLocalSearchParams<{ owner: string; repo: string; number: string }>();
  const issueNumber = parseInt(number || '0', 10);
  const [commentText, setCommentText] = useState('');

  const { data: issue, isLoading: issueLoading } = useIssue({
    owner: owner || '',
    repo: repo || '',
    issueNumber,
  });

  const { data: commentsData, isLoading: commentsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useIssueComments({
    owner: owner || '',
    repo: repo || '',
    issueNumber,
  });

  const createComment = useCreateIssueComment();
  const updateIssue = useUpdateIssue();

  const comments: GitHubComment[] = commentsData?.pages.flatMap((page) => page) || [];

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !owner || !repo) return;

    try {
      await createComment.mutateAsync({
        owner,
        repo,
        issueNumber,
        body: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleToggleState = async () => {
    if (!issue || !owner || !repo) return;

    try {
      await updateIssue.mutateAsync({
        owner,
        repo,
        issueNumber,
        state: issue.state === 'open' ? 'closed' : 'open',
      });
    } catch (error) {
      console.error('Failed to update issue:', error);
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
    if (!issue) return null;

    return (
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          <View className={`px-3 py-1 rounded-full ${issue.state === 'open' ? 'bg-green-900' : 'bg-purple-900'}`}>
            <Text className={`text-sm ${issue.state === 'open' ? 'text-green-400' : 'text-purple-400'}`}>
              {issue.state === 'open' ? '🟢 Open' : '🟣 Closed'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleToggleState}
            disabled={updateIssue.isPending}
            className="ml-auto"
          >
            <Text className="text-blue-400 text-sm">
              {updateIssue.isPending ? '...' : issue.state === 'open' ? 'Close' : 'Reopen'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-xl font-bold">{issue.title}</Text>

        <View className="flex-row items-center mt-2 gap-2">
          <Avatar uri={issue.user.avatar_url} name={issue.user.login} size={20} />
          <Text className="text-gray-500 text-sm">
            {issue.user.login} opened {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true, locale: ja })}
          </Text>
        </View>

        {issue.labels.length > 0 && (
          <View className="flex-row flex-wrap mt-3 gap-1">
            {issue.labels.map((label) => (
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

        {issue.body && (
          <View className="mt-4 p-4 bg-gray-900 rounded-lg">
            <Text className="text-gray-300">{issue.body}</Text>
          </View>
        )}

        <View className="border-t border-gray-800 mt-4 pt-4">
          <Text className="text-gray-500 text-sm font-semibold">
            コメント ({issue.comments})
          </Text>
        </View>
      </View>
    );
  };

  if (issueLoading) {
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

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import {
  useTierListComments,
  useCreateComment,
  useDeleteComment,
} from '@/features/social/hooks/useComments';
import { CommentItem } from '@/components/social/CommentItem';
import { Comment } from '@/features/social/types/social.types';

export default function Comments() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTierListComments(id);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const comments: Comment[] = data?.pages.flatMap((page) => page.data) || [];

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment.mutateAsync({
        tierListId: id,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      // エラー時はコメントテキストを保持
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (comment: Comment) => {
    deleteComment.mutate({
      id: comment.id,
      tierListId: id,
    });
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="items-center py-12">
      <Text className="text-gray-500 text-base">コメントはまだありません</Text>
      <Text className="text-gray-600 text-sm mt-1">最初のコメントを書いてみましょう</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#121212]"
    >
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">コメント</Text>
      </View>

      {/* コメントリスト */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onDelete={item.userId === user?.id ? () => handleDelete(item) : undefined}
            />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          style={{ flex: 1 }}
          inverted={false}
        />
      )}

      {/* コメント入力 */}
      <View className="border-t border-gray-800 p-4 bg-[#1A1A1A]">
        <View className="flex-row gap-2 items-center">
          <TextInput
            className="flex-1 bg-[#2A2A2A] text-white p-3 rounded-lg text-sm"
            placeholder="コメントを書いてください…"
            placeholderTextColor="#9E9E9E"
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleSubmit}
            multiline
            maxHeight={100}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              commentText.trim() && !isSubmitting ? 'bg-primary-500' : 'bg-gray-700'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">送信</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFollowers } from '@/features/user/hooks/useFollow';
import { Avatar } from '@/components/common/Avatar';
import { FollowButton } from '@/components/social/FollowButton';
import { User } from '@/types/user.types';

export default function Followers() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFollowers(id);

  const followers: User[] = data?.pages.flatMap((page) => page.data) || [];

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => router.push(`/main/user/${item.id}`)}
      className="flex-row items-center px-4 py-3 border-b border-gray-800"
      activeOpacity={0.7}
    >
      <Avatar uri={item.photoURL} name={item.displayName} size={50} />
      <View className="flex-1 ml-3">
        <Text className="text-white font-semibold">{item.displayName}</Text>
        {item.bio && (
          <Text className="text-gray-500 text-sm" numberOfLines={1}>
            {item.bio}
          </Text>
        )}
      </View>
      <FollowButton userId={item.id} compact />
    </TouchableOpacity>
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
    <View className="flex-1 justify-center items-center">
      <Text className="text-gray-500 text-base">フォロワーがいません</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">フォロワー</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={followers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

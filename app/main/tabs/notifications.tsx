import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/features/notifications/hooks/useNotifications';
import { Avatar } from '@/components/common/Avatar';
import { Notification } from '@/features/notifications/types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

const NOTIFICATION_ICONS: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
};

export default function Notifications() {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications: Notification[] = data?.pages.flatMap((page) => page.data) || [];

  const handleNotificationPress = async (notification: Notification) => {
    // 既読にする
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }

    // 適切な画面に遷移
    switch (notification.targetType) {
      case 'tierList':
        router.push(`/main/tier/${notification.targetId}`);
        break;
      case 'user':
        router.push(`/main/user/${notification.actorId}`);
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
      locale: ja,
    });

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        className={`flex-row items-start px-4 py-3 border-b border-gray-800 ${
          !item.isRead ? 'bg-[#1A1A1A]' : ''
        }`}
        activeOpacity={0.7}
      >
        <View className="relative">
          <Avatar uri={item.actorPhotoURL} name={item.actorName} size={50} />
          <View className="absolute -bottom-1 -right-1 bg-[#121212] rounded-full p-1">
            <Text className="text-xs">{NOTIFICATION_ICONS[item.type]}</Text>
          </View>
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-white text-sm">
            <Text className="font-semibold">{item.actorName}</Text>
            <Text className="text-gray-400"> {item.message}</Text>
          </Text>
          <Text className="text-gray-600 text-xs mt-1">{timeAgo}</Text>
        </View>

        {!item.isRead && (
          <View className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
        )}
      </TouchableOpacity>
    );
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
    <View className="flex-1 justify-center items-center px-8">
      <Text className="text-4xl mb-4">🔔</Text>
      <Text className="text-white text-lg font-bold">通知はありません</Text>
      <Text className="text-gray-500 text-sm mt-2 text-center">
        いいねやコメント、フォローがあると通知が届きます
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">通知</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="text-primary-500 text-sm font-semibold">すべて既読</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor="#2196F3"
            />
          }
        />
      )}
    </View>
  );
}

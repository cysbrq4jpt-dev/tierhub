import { View, Text } from 'react-native';

export default function Notifications() {
  return (
    <View className="flex-1 bg-[#121212]">
      <View className="p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">Notifications</Text>
        <Text className="text-sm text-gray-500 mt-1">お知らせ</Text>
      </View>
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">通知はまだありません</Text>
      </View>
    </View>
  );
}

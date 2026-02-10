import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function GitHubCallback() {
  const router = useRouter();

  useEffect(() => {
    // This page handles the OAuth callback
    // expo-auth-session should automatically handle the response
    // We just need to redirect back to the GitHub page
    const timer = setTimeout(() => {
      router.replace('/main/github');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-[#121212] justify-center items-center">
      <ActivityIndicator color="#2196F3" size="large" />
      <Text className="text-gray-400 mt-4">GitHubに接続中...</Text>
    </View>
  );
}

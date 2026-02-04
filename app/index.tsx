import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/hooks';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/main/tabs');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <View className="flex-1 justify-center items-center bg-[#121212]">
      <ActivityIndicator size="large" color="#2196F3" />
      <Text className="mt-4 text-2xl font-bold text-white">TierHub</Text>
    </View>
  );
}

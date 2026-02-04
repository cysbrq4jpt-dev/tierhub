import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLogin } from '@/features/auth/hooks';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const { isLoading, handleGoogleLogin, handleAppleLogin, canUseApple } = useLogin();
  const { error } = useAuthStore();

  // エラーがあればアラートを表示
  if (error) {
    Alert.alert('Authentication Error', error);
  }

  return (
    <View className="flex-1 bg-[#212121] p-6 justify-between">
      {/* Header */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-5xl font-bold text-[#2196F3] mb-2">TierHub</Text>
        <Text className="text-base text-gray-500 text-center">
          Create. Share. Rank Everything.
        </Text>
      </View>

      {/* Buttons */}
      <View className="gap-4 mb-8">
        <TouchableOpacity
          className="bg-[#2196F3] h-14 rounded-lg justify-center items-center"
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-semibold">Sign in with Google</Text>
          )}
        </TouchableOpacity>

        {canUseApple && (
          <TouchableOpacity
            className="bg-black h-14 rounded-lg justify-center items-center"
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign in with Apple</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Terms */}
      <Text className="text-xs text-gray-600 text-center mb-4">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

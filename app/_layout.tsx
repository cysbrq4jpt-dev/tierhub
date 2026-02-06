import '../global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { logError } from '@/utils/errorHandling';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // ネットワークエラーの場合は最大3回リトライ
        if (error instanceof Error && error.message.includes('network')) {
          return failureCount < 3;
        }
        // その他のエラーは1回のみリトライ
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5分間キャッシュを有効とする
      onError: (error) => {
        logError(error, 'React Query');
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        logError(error, 'React Query Mutation');
      },
    },
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="main" />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

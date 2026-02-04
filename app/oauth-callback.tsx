import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { signInWithGoogle } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

/**
 * OAuth コールバックハンドラー
 * Google OAuth認証後のリダイレクトを処理します
 */
export default function OAuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, setError } = useAuthStore();
  const [status, setStatus] = useState('Processing authentication...');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // 既に処理中の場合はスキップ
      if (isProcessing) {
        console.log('⏸️ Already processing, skipping...');
        return;
      }

      setIsProcessing(true);
      try {
        console.log('🔐 OAuth callback received');
        console.log('📦 URL params:', params);

        let idToken: string | null = null;
        let error: string | null = null;

        if (Platform.OS === 'web') {
          // Web環境: URLからaccess_tokenまたはid_tokenを取得
          // Google OAuthの場合、URLフラグメント(#)の後にパラメータが含まれる
          const hash = window.location.hash;
          console.log('🔗 URL hash:', hash);

          // URLハッシュからパラメータをパース
          const hashParams = new URLSearchParams(hash.substring(1));
          idToken = hashParams.get('id_token');
          const accessToken = hashParams.get('access_token');
          error = hashParams.get('error');

          console.log('🔑 ID Token:', idToken ? 'Present' : 'Missing');
          console.log('🔑 Access Token:', accessToken ? 'Present' : 'Missing');
        } else {
          // Native環境: expo-auth-sessionが自動処理するため、ログイン画面に戻る
          console.log('📱 Native platform, redirecting to login');
          setTimeout(() => {
            router.replace('/auth/login');
          }, 100);
          return;
        }

        if (error) {
          console.error('❌ OAuth error:', error);
          setError(error || 'Authentication failed');
          setStatus('Authentication failed');

          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
          return;
        }

        if (idToken) {
          console.log('✅ ID Token found, signing in with Firebase...');
          setStatus('Signing in with Firebase...');

          const user = await signInWithGoogle(idToken);
          console.log('✅ Firebase sign-in successful!', user);

          setUser(user);
          setStatus('Success! Redirecting...');

          // URLハッシュをクリア（重複実行を防ぐ）
          if (Platform.OS === 'web') {
            window.history.replaceState(null, '', window.location.pathname);
          }

          // メイン画面へ遷移
          setTimeout(() => {
            router.replace('/main/tabs');
          }, 500);
        } else {
          console.log('⚠️ No ID token found in URL');
          setStatus('No authentication token found. Returning to login...');

          setTimeout(() => {
            router.replace('/auth/login');
          }, 2000);
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('Error occurred');

        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      }
    };

    handleCallback();
  }, []); // 依存配列を空にして、初回のみ実行

  return (
    <View className="flex-1 bg-[#212121] justify-center items-center gap-4">
      <ActivityIndicator size="large" color="#2196F3" />
      <Text className="text-white text-lg">{status}</Text>
    </View>
  );
}

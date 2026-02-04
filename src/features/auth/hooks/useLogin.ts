import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import { ResponseType } from 'expo-auth-session';
import { signInWithGoogle, signInWithApple } from '@/services/firebase/auth';
import { useAuthStore } from '@/stores/authStore';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setError } = useAuthStore();

  // Redirect URIを明示的に設定
  // Web環境では、アプリが動作しているポート (3000) を使用
  const redirectUri = Platform.OS === 'web'
    ? 'http://localhost:3000/oauth-callback'
    : AuthSession.makeRedirectUri({
        scheme: 'tierhub',
        path: 'oauth-callback',
      });

  // Google認証の設定
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: redirectUri,
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
  });

  // Redirect URIをログに出力（デバッグ用）
  useEffect(() => {
    console.log('🔐 OAuth Redirect URI:', redirectUri);
    console.log('🔐 Web Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  }, [redirectUri]);

  // Google認証のレスポンスを処理
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      console.log('✅ Google authentication successful!');
      console.log('Authentication:', authentication);

      if (authentication?.idToken) {
        handleGoogleAuthSuccess(authentication.idToken);
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google authentication error:', response.error);
      setError(response.error?.message || 'Authentication failed');
    }
  }, [response]);

  // Google認証成功時の処理
  const handleGoogleAuthSuccess = async (idToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Signing in with Firebase...');

      const user = await signInWithGoogle(idToken);
      console.log('✅ Firebase sign-in successful!', user);
      setUser(user);
    } catch (error) {
      console.error('❌ Firebase sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Firebase');
    } finally {
      setIsLoading(false);
    }
  };

  // Googleログイン処理
  const handleGoogleLogin = async () => {
    try {
      console.log('🔐 Starting Google login...');
      setIsLoading(true);
      setError(null);
      await promptAsync();
    } catch (error) {
      console.error('❌ Google login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start Google login');
      setIsLoading(false);
    }
  };

  // Appleログイン処理
  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Appleログインが利用可能かチェック
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple sign-in is not available on this device');
      }

      const user = await signInWithApple();
      setUser(user);
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // ユーザーがキャンセルした場合は何もしない
        console.log('Apple sign-in canceled');
      } else {
        console.error('Apple sign-in error:', error);
        setError(error instanceof Error ? error.message : 'Failed to sign in with Apple');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleGoogleLogin,
    handleAppleLogin,
    canUseApple: Platform.OS === 'ios',
  };
};

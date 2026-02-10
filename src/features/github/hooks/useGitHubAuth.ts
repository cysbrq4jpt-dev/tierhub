import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useGitHubStore } from '@/stores/githubStore';
import { getCurrentUser } from '@/services/github/api';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export const useGitHubAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    accessToken,
    user,
    isConnected,
    setAccessToken,
    setUser,
    setError,
    disconnect,
  } = useGitHubStore();

  const redirectUri = Platform.OS === 'web'
    ? 'http://localhost:3000/github-callback'
    : AuthSession.makeRedirectUri({
        scheme: 'tierhub',
        path: 'github-callback',
      });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || '',
      scopes: ['repo', 'read:user', 'user:email'],
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    console.log('🔐 GitHub OAuth Redirect URI:', redirectUri);
  }, [redirectUri]);

  useEffect(() => {
    if (response?.type === 'success' && response.params.code) {
      handleAuthCode(response.params.code);
    } else if (response?.type === 'error') {
      console.error('❌ GitHub authentication error:', response.error);
      setError(response.error?.message || 'GitHub authentication failed');
    }
  }, [response]);

  // Load user info when we have a token but no user
  useEffect(() => {
    if (accessToken && !user) {
      loadUserInfo();
    }
  }, [accessToken, user]);

  const handleAuthCode = async (code: string) => {
    try {
      setIsLoading(true);
      console.log('🔄 Exchanging code for access token...');

      // Exchange code for access token
      // Note: In production, this should be done on your backend for security
      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      if (tokenData.access_token) {
        console.log('✅ GitHub access token received');
        setAccessToken(tokenData.access_token);
      }
    } catch (error) {
      console.error('❌ Token exchange error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get access token');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserInfo = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const userInfo = await getCurrentUser(accessToken);
      setUser({
        id: userInfo.id,
        login: userInfo.login,
        name: userInfo.name,
        avatar_url: userInfo.avatar_url,
        html_url: userInfo.html_url,
      });
      console.log('✅ GitHub user info loaded:', userInfo.login);
    } catch (error) {
      console.error('❌ Failed to load user info:', error);
      // Token might be invalid, disconnect
      disconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const connectGitHub = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔐 Starting GitHub login...');
      await promptAsync();
    } catch (error) {
      console.error('❌ GitHub login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start GitHub login');
      setIsLoading(false);
    }
  };

  const disconnectGitHub = () => {
    disconnect();
    console.log('✅ GitHub disconnected');
  };

  return {
    isLoading,
    isConnected,
    user,
    connectGitHub,
    disconnectGitHub,
    canConnect: !!request,
  };
};

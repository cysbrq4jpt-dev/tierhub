import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // エラーをログに記録
    console.error('ErrorBoundary caught error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: エラー監視サービス（Sentry等）に送信
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-[#121212] justify-center items-center p-6">
          <View className="bg-[#1E1E1E] rounded-xl p-6 w-full max-w-md">
            <Text className="text-2xl mb-4 text-center">⚠️</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              エラーが発生しました
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-4">
              予期しないエラーが発生しました。アプリを再起動してください。
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView
                className="bg-[#0A0A0A] rounded p-3 mb-4 max-h-48"
                showsVerticalScrollIndicator
              >
                <Text className="text-red-400 text-xs font-mono">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text className="text-gray-500 text-xs font-mono mt-2">
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={this.handleReset}
              className="bg-primary-500 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">
                再試行
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

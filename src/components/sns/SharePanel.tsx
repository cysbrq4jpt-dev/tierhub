import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Share, Linking } from 'react-native';
import { EmbedCode } from '@/types/sns.types';
import { getEmbedCode, generateTwitterShareUrl } from '@/features/sns/services/ogpService';

interface SharePanelProps {
  tierListId: string;
  tierListTitle: string;
  catchCopy: string;
  onClose: () => void;
}

/**
 * シェアパネル
 * SNSシェア、埋め込みコード生成、OGPプレビューを統合したパネル。
 */
export const SharePanel: React.FC<SharePanelProps> = ({
  tierListId,
  tierListTitle,
  catchCopy,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'embed'>('share');
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light'>('dark');
  const [showExplanations, setShowExplanations] = useState(true);
  const [copied, setCopied] = useState(false);

  const embedCode = getEmbedCode(tierListId, {
    theme: embedTheme,
    showExplanations,
  });

  const handleCopyEmbed = useCallback(
    (code: string) => {
      // Clipboard APIを使用（react-native-clipboard等）
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    []
  );

  const handleTwitterShare = useCallback(() => {
    const url = generateTwitterShareUrl(tierListId, catchCopy);
    Linking.openURL(url);
  }, [tierListId, catchCopy]);

  const handleNativeShare = useCallback(async () => {
    try {
      await Share.share({
        title: tierListTitle,
        message: `${catchCopy}\n\n#TierHub`,
        url: `https://tierhub.app/tier/${tierListId}`,
      });
    } catch {
      // ユーザーがキャンセル
    }
  }, [tierListId, tierListTitle, catchCopy]);

  return (
    <View className="bg-[#1A1A1A] rounded-t-2xl">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
        <Text className="text-white text-lg font-bold">シェア</Text>
        <TouchableOpacity onPress={onClose}>
          <Text className="text-gray-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {/* タブ */}
      <View className="flex-row border-b border-gray-800">
        {(['share', 'embed'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab ? 'border-b-2 border-blue-500' : ''
            }`}
          >
            <Text
              className={`text-sm ${
                activeTab === tab ? 'text-white font-bold' : 'text-gray-400'
              }`}
            >
              {tab === 'share' ? 'SNSシェア' : '埋め込み'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="p-4 max-h-96">
        {activeTab === 'share' ? (
          <View>
            {/* キャッチコピープレビュー */}
            <View className="bg-[#2A2A2A] rounded-lg p-3 mb-4">
              <Text className="text-gray-500 text-xs mb-1">自動生成キャッチコピー</Text>
              <Text className="text-yellow-300 text-sm font-bold">{catchCopy}</Text>
            </View>

            {/* シェアボタン */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleTwitterShare}
                className="bg-[#1DA1F2] py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">X（Twitter）でシェア</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNativeShare}
                className="bg-gray-700 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-bold">その他のアプリでシェア</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            {/* 埋め込み設定 */}
            <View className="mb-4">
              <Text className="text-gray-400 text-xs mb-2">テーマ</Text>
              <View className="flex-row gap-2">
                {(['dark', 'light'] as const).map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    onPress={() => setEmbedTheme(theme)}
                    className={`flex-1 py-2 rounded items-center ${
                      embedTheme === theme ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    <Text className="text-white text-sm">
                      {theme === 'dark' ? 'ダーク' : 'ライト'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-400 text-xs">
                ホバーで解説メモ表示
              </Text>
              <TouchableOpacity
                onPress={() => setShowExplanations(!showExplanations)}
                className={`px-3 py-1 rounded ${
                  showExplanations ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <Text className="text-white text-xs">
                  {showExplanations ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* iframeコード */}
            <View className="mb-3">
              <Text className="text-gray-400 text-xs mb-1">iframe</Text>
              <View className="bg-[#0D1117] rounded p-2">
                <Text className="text-green-400 text-xs font-mono" selectable>
                  {embedCode.iframe}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopyEmbed(embedCode.iframe)}
                className="bg-gray-700 py-2 rounded items-center mt-1"
              >
                <Text className="text-white text-xs">
                  {copied ? 'コピーしました!' : 'コピー'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* scriptコード */}
            <View>
              <Text className="text-gray-400 text-xs mb-1">script</Text>
              <View className="bg-[#0D1117] rounded p-2">
                <Text className="text-green-400 text-xs font-mono" selectable>
                  {embedCode.script}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopyEmbed(embedCode.script)}
                className="bg-gray-700 py-2 rounded items-center mt-1"
              >
                <Text className="text-white text-xs">
                  {copied ? 'コピーしました!' : 'コピー'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

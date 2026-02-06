import { View, Text, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/features/auth/hooks/useLogout';
import Constants from 'expo-constants';

interface SettingItem {
  title: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function Settings() {
  const router = useRouter();
  const { user } = useAuthStore();
  const logout = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: logout.handleLogout,
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'アカウント削除',
      'アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            // TODO: アカウント削除処理を実装
            Alert.alert('未実装', 'アカウント削除機能は準備中です');
          },
        },
      ]
    );
  };

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('エラー', 'URLを開けませんでした');
    });
  };

  const sections: SettingSection[] = [
    {
      title: 'アカウント',
      items: [
        {
          title: 'プロフィール編集',
          description: '表示名、自己紹介、プロフィール画像',
          onPress: () => router.push('/main/profile/edit'),
        },
        {
          title: 'メールアドレス',
          description: user?.email || '',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'プライバシー',
      items: [
        {
          title: 'ブロックリスト',
          description: 'ブロックしたユーザーの管理',
          onPress: () => {
            Alert.alert('未実装', 'ブロックリスト機能は準備中です');
          },
        },
      ],
    },
    {
      title: 'サポート',
      items: [
        {
          title: 'ヘルプセンター',
          onPress: () => {
            Alert.alert('未実装', 'ヘルプセンターは準備中です');
          },
        },
        {
          title: 'お問い合わせ',
          onPress: () => {
            handleOpenURL('mailto:support@tierhub.app');
          },
        },
        {
          title: 'プライバシーポリシー',
          onPress: () => {
            handleOpenURL('https://tierhub.app/privacy');
          },
        },
        {
          title: '利用規約',
          onPress: () => {
            handleOpenURL('https://tierhub.app/terms');
          },
        },
      ],
    },
    {
      title: 'アプリ情報',
      items: [
        {
          title: 'バージョン',
          description: Constants.expoConfig?.version || '1.0.0',
          onPress: () => {},
        },
        {
          title: 'ライセンス',
          onPress: () => {
            Alert.alert('未実装', 'ライセンス情報は準備中です');
          },
        },
      ],
    },
    {
      title: '危険な操作',
      items: [
        {
          title: 'ログアウト',
          onPress: handleLogout,
        },
        {
          title: 'アカウント削除',
          description: 'すべてのデータが完全に削除されます',
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary-500 text-base">← 戻る</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">設定</Text>
      </View>

      <ScrollView className="flex-1">
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mt-6">
            <Text className="text-gray-500 text-xs font-semibold uppercase px-4 mb-2">
              {section.title}
            </Text>
            <View className="bg-[#1E1E1E]">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    itemIndex < section.items.length - 1 ? 'border-b border-gray-800' : ''
                  }`}
                  activeOpacity={0.7}
                  disabled={!item.onPress}
                >
                  <View className="flex-1">
                    <Text
                      className={`text-base ${
                        item.destructive ? 'text-red-500' : 'text-white'
                      } font-medium`}
                    >
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {item.onPress && (
                    <Text className="text-gray-600 ml-2">›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* フッター */}
        <View className="items-center py-8">
          <Text className="text-gray-600 text-xs">TierHub</Text>
          <Text className="text-gray-700 text-xs mt-1">
            © 2024 TierHub. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

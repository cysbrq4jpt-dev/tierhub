import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTimeline, usePopularTierLists, useRecentTierLists } from '@/features/timeline/hooks/useTimeline';
import { TierCard } from '@/components/tier/TierCard';
import { TierList } from '@/types/tier.types';

type TabKey = 'following' | 'popular' | 'recent';

export default function Timeline() {
  const [activeTab, setActiveTab] = useState<TabKey>('following');

  const following = useTimeline();
  const popular = usePopularTierLists();
  const recent = useRecentTierLists();

  const getDataAndControls = () => {
    switch (activeTab) {
      case 'following':
        return following;
      case 'popular':
        return popular;
      case 'recent':
        return recent;
    }
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = getDataAndControls();

  const tierLists: TierList[] = data?.pages.flatMap((page) => page.data) || [];

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#2196F3" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center mt-24 px-8">
      {activeTab === 'following' ? (
        <>
          <Text className="text-gray-500 text-base">フォロー中のユーザーがいません</Text>
          <Text className="text-gray-600 text-sm mt-2 text-center">
            人気 や 新着 のタブで他のユーザーのTIER表を見つけてみましょう
          </Text>
        </>
      ) : (
        <Text className="text-gray-500 text-base">まだTIER表がありません</Text>
      )}
    </View>
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'following', label: 'フォロー中' },
    { key: 'popular', label: '人気' },
    { key: 'recent', label: '新着' },
  ];

  return (
    <View className="flex-1 bg-[#121212]">
      {/* Header */}
      <View className="p-4 border-b border-gray-800">
        <Text className="text-2xl font-bold text-white">Timeline</Text>
      </View>

      {/* タブ切り替え */}
      <View className="flex-row border-b border-gray-800">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 items-center ${
              activeTab === tab.key ? 'border-b-2 border-primary-500' : ''
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? 'text-primary-500' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* リスト */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2196F3" size="large" />
        </View>
      ) : (
        <FlatList
          data={tierLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TierCard tierList={item} showAuthor />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          className="flex-1"
          key={activeTab}
        />
      )}
    </View>
  );
}

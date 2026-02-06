import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RefObject } from 'react';
import { shareTierListImage } from '@/features/tier/utils/imageExport';

interface ShareButtonProps {
  title: string;
  /** View ref for image capture. If provided, "Share as Image" option is shown. */
  viewRef?: RefObject<View>;
  compact?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  viewRef,
  compact = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShareText = async () => {
    setShowModal(false);
    try {
      await Share.share({
        message: `${title} - TierHub`,
      });
    } catch {
      // User cancelled
    }
  };

  const handleShareImage = async () => {
    if (!viewRef?.current) return;
    setIsSharing(true);
    try {
      await shareTierListImage(viewRef, title);
    } catch {
      Alert.alert('エラー', '画像の共有に失敗しました');
    } finally {
      setIsSharing(false);
      setShowModal(false);
    }
  };

  const handlePress = () => {
    if (viewRef) {
      setShowModal(true);
    } else {
      handleShareText();
    }
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity
          onPress={handlePress}
          className="flex-row items-center gap-1"
          activeOpacity={0.6}
        >
          <Text className="text-gray-400 text-base">↗</Text>
          <Text className="text-gray-400 text-sm">共有</Text>
        </TouchableOpacity>
        {renderModal()}
      </>
    );
  }

  function renderModal() {
    return (
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View className="bg-[#1E1E1E] rounded-t-2xl p-4 pb-8">
            <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-4" />
            <Text className="text-white text-lg font-bold mb-4">共有</Text>

            {/* Share as Image */}
            <TouchableOpacity
              onPress={handleShareImage}
              disabled={isSharing}
              className="flex-row items-center bg-[#2A2A2A] rounded-xl p-4 mb-3"
              activeOpacity={0.7}
            >
              {isSharing ? (
                <ActivityIndicator color="#2196F3" size="small" />
              ) : (
                <Text className="text-2xl mr-3">🖼</Text>
              )}
              <View className="flex-1">
                <Text className="text-white font-semibold">画像として共有</Text>
                <Text className="text-gray-400 text-sm">
                  TIER表を画像にしてSNSに投稿
                </Text>
              </View>
            </TouchableOpacity>

            {/* Share as Text */}
            <TouchableOpacity
              onPress={handleShareText}
              className="flex-row items-center bg-[#2A2A2A] rounded-xl p-4 mb-3"
              activeOpacity={0.7}
            >
              <Text className="text-2xl mr-3">📝</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold">テキストで共有</Text>
                <Text className="text-gray-400 text-sm">
                  タイトルとリンクをテキストで送信
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="items-center py-3 mt-1"
              activeOpacity={0.7}
            >
              <Text className="text-gray-400 font-semibold">キャンセル</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500"
        activeOpacity={0.7}
      >
        <Text className="text-white text-base">↗</Text>
        <Text className="text-white text-sm font-semibold">共有</Text>
      </TouchableOpacity>
      {renderModal()}
    </>
  );
};

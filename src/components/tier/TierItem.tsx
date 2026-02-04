import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { TierItem as TierItemType } from '@/types/tier.types';

interface TierItemProps {
  item: TierItemType;
  onPress?: () => void;
  onLongPress?: () => void;
  isActive?: boolean;
  isSelected?: boolean;
}

export const TierItem: React.FC<TierItemProps> = ({
  item,
  onPress,
  onLongPress,
  isActive = false,
  isSelected = false,
}) => {
  const imageUrl = item.customImageUrl;
  const label = item.customLabel;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={`w-16 h-16 m-1 rounded overflow-hidden ${
        isActive ? 'opacity-80 scale-105' : ''
      } ${isSelected ? 'border-2 border-blue-400' : ''}`}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View
          className={`w-full h-full justify-center items-center p-1 ${
            isSelected ? 'bg-[#3A3A5A]' : 'bg-gray-700'
          }`}
        >
          <Text className="text-xs text-gray-400 text-center" numberOfLines={2}>
            {label || 'Item'}
          </Text>
        </View>
      )}
      {isSelected && (
        <View className="absolute top-0.5 right-0.5 bg-blue-500 rounded-full w-3 h-3 items-center justify-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </Pressable>
  );
};

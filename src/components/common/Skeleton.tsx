import { View } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#2A2A2A',
        },
        animatedStyle,
      ]}
      className={className}
    />
  );
}

// プリセットスケルトン
export function SkeletonCard() {
  return (
    <View className="bg-[#1E1E1E] rounded-xl p-4 m-4">
      <Skeleton height={16} width="60%" className="mb-2" />
      <Skeleton height={12} width="40%" className="mb-4" />
      <Skeleton height={150} width="100%" borderRadius={8} className="mb-3" />
      <View className="flex-row gap-4">
        <Skeleton height={12} width={60} />
        <Skeleton height={12} width={60} />
        <Skeleton height={12} width={60} />
      </View>
    </View>
  );
}

export function SkeletonTierCard() {
  return (
    <View className="bg-[#1E1E1E] rounded-xl mx-4 my-2 overflow-hidden">
      {/* ヘッダー */}
      <View className="p-3 border-b border-gray-800">
        <View className="flex-row items-center gap-2">
          <Skeleton height={32} width={32} borderRadius={16} />
          <View className="flex-1">
            <Skeleton height={14} width="50%" className="mb-1" />
            <Skeleton height={10} width="30%" />
          </View>
        </View>
      </View>

      {/* コンテンツ */}
      <View className="p-3">
        <Skeleton height={16} width="70%" className="mb-2" />
        <Skeleton height={12} width="50%" className="mb-3" />
        <Skeleton height={120} width="100%" borderRadius={8} className="mb-2" />
        <View className="flex-row gap-3">
          <Skeleton height={10} width={40} />
          <Skeleton height={10} width={40} />
          <Skeleton height={10} width={40} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonUserItem() {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-800">
      <Skeleton height={50} width={50} borderRadius={25} />
      <View className="flex-1 ml-3">
        <Skeleton height={14} width="60%" className="mb-2" />
        <Skeleton height={10} width="80%" />
      </View>
      <Skeleton height={28} width={70} borderRadius={14} />
    </View>
  );
}

export function SkeletonProfile() {
  return (
    <View className="items-center px-4 py-6">
      <Skeleton height={80} width={80} borderRadius={40} className="mb-3" />
      <Skeleton height={20} width="50%" className="mb-2" />
      <Skeleton height={12} width="70%" className="mb-4" />
      <View className="flex-row gap-8">
        <View className="items-center">
          <Skeleton height={20} width={40} className="mb-1" />
          <Skeleton height={10} width={50} />
        </View>
        <View className="items-center">
          <Skeleton height={20} width={40} className="mb-1" />
          <Skeleton height={10} width={50} />
        </View>
        <View className="items-center">
          <Skeleton height={20} width={40} className="mb-1" />
          <Skeleton height={10} width={50} />
        </View>
      </View>
    </View>
  );
}

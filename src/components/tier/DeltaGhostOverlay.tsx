import React from 'react';
import { View, Text } from 'react-native';
import { TierDelta } from '@/types/version.types';
import { TIER_RANKS, TierRank } from '@/types/tier.types';
import { useVersionStore } from '@/stores/versionStore';

interface DeltaGhostOverlayProps {
  deltas: TierDelta[];
  itemNames: Record<string, string>; // itemId -> name
}

const DIRECTION_ICONS: Record<string, { icon: string; color: string }> = {
  up: { icon: '▲', color: '#4CAF50' },
  down: { icon: '▼', color: '#F44336' },
  new: { icon: '★', color: '#2196F3' },
  removed: { icon: '✕', color: '#757575' },
  same: { icon: '', color: 'transparent' },
};

/**
 * デルタ・ゴースト表示
 * 前バージョンの配置を半透明で表示し、変更箇所を視覚化。
 */
export const DeltaGhostOverlay: React.FC<DeltaGhostOverlayProps> = ({
  deltas,
  itemNames,
}) => {
  const { ghostEnabled } = useVersionStore();

  if (!ghostEnabled || deltas.length === 0) return null;

  // Tier別にデルタをグループ化
  const deltasByTier: Record<string, TierDelta[]> = {};
  for (const rank of TIER_RANKS) {
    deltasByTier[rank] = deltas.filter((d) => d.currentTier === rank);
  }

  return (
    <View className="absolute inset-0 pointer-events-none">
      {TIER_RANKS.map((rank) => {
        const tierDeltas = deltasByTier[rank] || [];
        if (tierDeltas.length === 0) return null;

        return (
          <View key={rank} className="flex-row flex-wrap px-16 py-1">
            {tierDeltas.map((delta) => {
              const dirInfo = DIRECTION_ICONS[delta.direction] || DIRECTION_ICONS.same;
              const name = itemNames[delta.itemId] || '???';

              return (
                <View
                  key={delta.itemId}
                  className="m-0.5 rounded px-1.5 py-0.5 flex-row items-center"
                  style={{ backgroundColor: `${dirInfo.color}20` }}
                >
                  {dirInfo.icon !== '' && (
                    <Text style={{ color: dirInfo.color, fontSize: 10, marginRight: 2 }}>
                      {dirInfo.icon}
                    </Text>
                  )}
                  <Text className="text-gray-400 text-xs" numberOfLines={1}>
                    {name}
                  </Text>
                  {delta.previousTier && delta.previousTier !== delta.currentTier && (
                    <Text className="text-gray-500 text-xs ml-1">
                      ({delta.previousTier}→{delta.currentTier})
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

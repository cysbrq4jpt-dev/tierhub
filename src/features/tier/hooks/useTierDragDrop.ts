import { useCallback } from 'react';
import { useTierEditorStore } from '@/stores/tierStore';
import { TierRank, DropResult } from '@/types/tier.types';

export const useTierDragDrop = () => {
  const { tiers, pool, moveItem, reorderWithinTier } = useTierEditorStore();

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { itemId, fromTier, toTier, newIndex } = result;

      if (fromTier === toTier) {
        // 同じTIER内での並び替え
        const items = fromTier === 'pool' ? pool : tiers[fromTier];
        const currentIndex = items.findIndex((item) => item.id === itemId);
        if (currentIndex !== -1 && currentIndex !== newIndex) {
          reorderWithinTier(fromTier, currentIndex, newIndex);
        }
      } else {
        // 異なるTIER間の移動
        moveItem(result);
      }
    },
    [tiers, pool, moveItem, reorderWithinTier]
  );

  const getItemsForTier = useCallback(
    (tier: TierRank | 'pool') => {
      return tier === 'pool' ? pool : tiers[tier];
    },
    [tiers, pool]
  );

  return {
    tiers,
    pool,
    handleDragEnd,
    getItemsForTier,
  };
};

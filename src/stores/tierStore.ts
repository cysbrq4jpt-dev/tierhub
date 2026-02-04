import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TierItem, TierData, TierRank, TIER_RANKS, DropResult } from '@/types/tier.types';

interface TierEditorState {
  // State
  categoryId: string | null;
  title: string;
  description: string;
  isPublic: boolean;
  tiers: TierData;
  pool: TierItem[]; // 未分類アイテム
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  initializeEditor: (categoryId: string) => void;
  resetEditor: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  addItemToPool: (item: TierItem) => void;
  removeItem: (itemId: string) => void;
  moveItem: (result: DropResult) => void;
  reorderWithinTier: (tier: TierRank | 'pool', fromIndex: number, toIndex: number) => void;
  setSaving: (isSaving: boolean) => void;
}

const createEmptyTiers = (): TierData => {
  return TIER_RANKS.reduce(
    (acc, rank) => {
      acc[rank] = [];
      return acc;
    },
    {} as Record<string, TierItem[]>
  );
};

export const useTierEditorStore = create<TierEditorState>()(
  immer((set) => ({
    // Initial State
    categoryId: null,
    title: '',
    description: '',
    isPublic: true,
    tiers: createEmptyTiers(),
    pool: [],
    isDirty: false,
    isSaving: false,

    // Actions
    initializeEditor: (categoryId) =>
      set((state) => {
        state.categoryId = categoryId;
        state.title = '';
        state.description = '';
        state.isPublic = true;
        state.tiers = createEmptyTiers();
        state.pool = [];
        state.isDirty = false;
      }),

    resetEditor: () =>
      set((state) => {
        state.categoryId = null;
        state.title = '';
        state.description = '';
        state.isPublic = true;
        state.tiers = createEmptyTiers();
        state.pool = [];
        state.isDirty = false;
        state.isSaving = false;
      }),

    setTitle: (title) =>
      set((state) => {
        state.title = title;
        state.isDirty = true;
      }),

    setDescription: (description) =>
      set((state) => {
        state.description = description;
        state.isDirty = true;
      }),

    setIsPublic: (isPublic) =>
      set((state) => {
        state.isPublic = isPublic;
        state.isDirty = true;
      }),

    addItemToPool: (item) =>
      set((state) => {
        state.pool.push(item);
        state.isDirty = true;
      }),

    removeItem: (itemId) =>
      set((state) => {
        // プールから削除
        state.pool = state.pool.filter((item) => item.id !== itemId);
        // 各TIERから削除
        TIER_RANKS.forEach((rank) => {
          state.tiers[rank] = state.tiers[rank].filter((item) => item.id !== itemId);
        });
        state.isDirty = true;
      }),

    moveItem: (result) =>
      set((state) => {
        const { itemId, fromTier, toTier, newIndex } = result;

        // 移動元からアイテムを取得して削除
        let movedItem: TierItem | undefined;

        if (fromTier === 'pool') {
          const index = state.pool.findIndex((item) => item.id === itemId);
          if (index !== -1) {
            [movedItem] = state.pool.splice(index, 1);
          }
        } else {
          const index = state.tiers[fromTier].findIndex((item) => item.id === itemId);
          if (index !== -1) {
            [movedItem] = state.tiers[fromTier].splice(index, 1);
          }
        }

        if (!movedItem) return;

        // 移動先に挿入
        movedItem.tier = toTier === 'pool' ? movedItem.tier : toTier;

        if (toTier === 'pool') {
          state.pool.splice(newIndex, 0, movedItem);
        } else {
          state.tiers[toTier].splice(newIndex, 0, movedItem);
        }

        // orderを再計算
        if (toTier !== 'pool') {
          state.tiers[toTier].forEach((item, idx) => {
            item.order = idx;
          });
        }

        state.isDirty = true;
      }),

    reorderWithinTier: (tier, fromIndex, toIndex) =>
      set((state) => {
        const items = tier === 'pool' ? state.pool : state.tiers[tier];
        const [movedItem] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, movedItem);

        // orderを再計算
        if (tier !== 'pool') {
          state.tiers[tier].forEach((item, idx) => {
            item.order = idx;
          });
        }

        state.isDirty = true;
      }),

    setSaving: (isSaving) =>
      set((state) => {
        state.isSaving = isSaving;
      }),
  }))
);

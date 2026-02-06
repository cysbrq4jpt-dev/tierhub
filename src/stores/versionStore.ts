import { create } from 'zustand';
import { TierListVersion, TierDelta, VersionTimelineEntry } from '@/types/version.types';

interface VersionState {
  // 現在閲覧中のバージョン情報
  currentVersionId: string | null;
  versions: VersionTimelineEntry[];
  selectedVersion: TierListVersion | null;
  previousVersion: TierListVersion | null;
  deltas: TierDelta[];

  // デルタ・ゴースト表示
  ghostEnabled: boolean;

  // タイムトラベル中かどうか
  isTimeTraveling: boolean;

  // Actions
  setVersions: (versions: VersionTimelineEntry[]) => void;
  setSelectedVersion: (version: TierListVersion | null) => void;
  setPreviousVersion: (version: TierListVersion | null) => void;
  setDeltas: (deltas: TierDelta[]) => void;
  toggleGhost: () => void;
  setTimeTraveling: (isTraveling: boolean) => void;
  navigateToVersion: (versionId: string) => void;
  resetVersionState: () => void;
}

export const useVersionStore = create<VersionState>((set) => ({
  currentVersionId: null,
  versions: [],
  selectedVersion: null,
  previousVersion: null,
  deltas: [],
  ghostEnabled: true,
  isTimeTraveling: false,

  setVersions: (versions) => set({ versions }),

  setSelectedVersion: (version) =>
    set({ selectedVersion: version, currentVersionId: version?.id ?? null }),

  setPreviousVersion: (version) => set({ previousVersion: version }),

  setDeltas: (deltas) => set({ deltas }),

  toggleGhost: () => set((state) => ({ ghostEnabled: !state.ghostEnabled })),

  setTimeTraveling: (isTraveling) => set({ isTimeTraveling: isTraveling }),

  navigateToVersion: (versionId) =>
    set({ currentVersionId: versionId, isTimeTraveling: true }),

  resetVersionState: () =>
    set({
      currentVersionId: null,
      versions: [],
      selectedVersion: null,
      previousVersion: null,
      deltas: [],
      ghostEnabled: true,
      isTimeTraveling: false,
    }),
}));

import { create } from 'zustand';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  // Theme
  themeMode: ThemeMode;
  colorScheme: ColorSchemeName;

  // Modals
  isItemPickerVisible: boolean;
  isShareModalVisible: boolean;
  isConfirmModalVisible: boolean;
  confirmModalConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  updateColorScheme: () => void;
  showItemPicker: () => void;
  hideItemPicker: () => void;
  showShareModal: () => void;
  hideShareModal: () => void;
  showConfirmModal: (config: { title: string; message: string; onConfirm: () => void }) => void;
  hideConfirmModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial State
  themeMode: 'dark', // デフォルトをダークモードに
  colorScheme: 'dark',

  isItemPickerVisible: false,
  isShareModalVisible: false,
  isConfirmModalVisible: false,
  confirmModalConfig: null,

  // Actions
  setThemeMode: (mode) => {
    set({ themeMode: mode });
    get().updateColorScheme();
  },

  updateColorScheme: () => {
    const { themeMode } = get();
    if (themeMode === 'system') {
      set({ colorScheme: Appearance.getColorScheme() });
    } else {
      set({ colorScheme: themeMode });
    }
  },

  showItemPicker: () => set({ isItemPickerVisible: true }),
  hideItemPicker: () => set({ isItemPickerVisible: false }),

  showShareModal: () => set({ isShareModalVisible: true }),
  hideShareModal: () => set({ isShareModalVisible: false }),

  showConfirmModal: (config) =>
    set({ isConfirmModalVisible: true, confirmModalConfig: config }),
  hideConfirmModal: () => set({ isConfirmModalVisible: false, confirmModalConfig: null }),
}));

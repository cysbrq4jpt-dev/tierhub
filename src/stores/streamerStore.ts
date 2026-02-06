import { create } from 'zustand';
import {
  ChromaKeyColor,
  StreamerModeConfig,
  WidgetConfig,
  WidgetDisplayMode,
} from '@/types/streamer.types';

interface StreamerState {
  // ストリーマーモード設定
  config: StreamerModeConfig;
  widgetConfig: WidgetConfig;

  // 投票セッション
  activeSessionId: string | null;

  // Actions
  toggleStreamerMode: () => void;
  toggleChromaKey: () => void;
  setChromaKeyColor: (color: ChromaKeyColor) => void;
  toggleFocusMode: () => void;
  toggleWidget: () => void;
  setWidgetDisplayMode: (mode: WidgetDisplayMode) => void;
  setWidgetShowPercentage: (show: boolean) => void;
  setWidgetAnimation: (enabled: boolean) => void;
  setActiveSession: (sessionId: string | null) => void;
  resetStreamerMode: () => void;
}

const defaultConfig: StreamerModeConfig = {
  enabled: false,
  chromaKeyEnabled: false,
  chromaKeyColor: 'green',
  focusModeEnabled: false,
  widgetEnabled: false,
};

const defaultWidgetConfig: WidgetConfig = {
  displayMode: 'bar',
  showPercentage: true,
  animationEnabled: true,
  maxVisibleOptions: 10,
};

export const useStreamerStore = create<StreamerState>((set) => ({
  config: { ...defaultConfig },
  widgetConfig: { ...defaultWidgetConfig },
  activeSessionId: null,

  toggleStreamerMode: () =>
    set((state) => ({
      config: { ...state.config, enabled: !state.config.enabled },
    })),

  toggleChromaKey: () =>
    set((state) => ({
      config: { ...state.config, chromaKeyEnabled: !state.config.chromaKeyEnabled },
    })),

  setChromaKeyColor: (color) =>
    set((state) => ({
      config: { ...state.config, chromaKeyColor: color },
    })),

  toggleFocusMode: () =>
    set((state) => ({
      config: { ...state.config, focusModeEnabled: !state.config.focusModeEnabled },
    })),

  toggleWidget: () =>
    set((state) => ({
      config: { ...state.config, widgetEnabled: !state.config.widgetEnabled },
    })),

  setWidgetDisplayMode: (mode) =>
    set((state) => ({
      widgetConfig: { ...state.widgetConfig, displayMode: mode },
    })),

  setWidgetShowPercentage: (show) =>
    set((state) => ({
      widgetConfig: { ...state.widgetConfig, showPercentage: show },
    })),

  setWidgetAnimation: (enabled) =>
    set((state) => ({
      widgetConfig: { ...state.widgetConfig, animationEnabled: enabled },
    })),

  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),

  resetStreamerMode: () =>
    set({
      config: { ...defaultConfig },
      widgetConfig: { ...defaultWidgetConfig },
      activeSessionId: null,
    }),
}));

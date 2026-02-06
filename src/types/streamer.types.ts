// ストリーマー・モード関連の型定義

export type ChromaKeyColor = 'green' | 'blue' | 'magenta' | 'transparent';

export const CHROMA_KEY_VALUES: Record<ChromaKeyColor, string> = {
  green: '#00FF00',
  blue: '#0000FF',
  magenta: '#FF00FF',
  transparent: 'transparent',
};

export const CHROMA_KEY_LABELS: Record<ChromaKeyColor, string> = {
  green: 'グリーン',
  blue: 'ブルー',
  magenta: 'マゼンタ',
  transparent: '完全透過',
};

export interface StreamerModeConfig {
  enabled: boolean;
  chromaKeyEnabled: boolean;
  chromaKeyColor: ChromaKeyColor;
  focusModeEnabled: boolean; // UI最小化
  widgetEnabled: boolean; // リアルタイム投票ウィジェット
}

// リアルタイム投票
export interface VotingSession {
  id: string;
  tierListId: string;
  hostUserId: string;
  title: string;
  status: 'active' | 'paused' | 'ended';
  options: VotingOption[];
  totalVotes: number;
  createdAt: Date;
  endedAt: Date | null;
}

export interface VotingOption {
  id: string;
  label: string;
  imageUrl: string | null;
  voteCount: number;
}

export interface Vote {
  id: string;
  sessionId: string;
  optionId: string;
  voterIp: string; // 匿名投票（IP重複チェック用）
  createdAt: Date;
}

export type WidgetDisplayMode = 'bar' | 'pie';

export interface WidgetConfig {
  displayMode: WidgetDisplayMode;
  showPercentage: boolean;
  animationEnabled: boolean;
  maxVisibleOptions: number;
}

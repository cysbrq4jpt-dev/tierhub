export const palette = {
  // Primary
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // TIER Colors
  tier: {
    S: '#FF7F7F',  // 赤
    A: '#FFBF7F',  // オレンジ
    B: '#FFDF7F',  // 黄
    C: '#FFFF7F',  // ライトイエロー
    D: '#BFFF7F',  // ライトグリーン
    F: '#7FBFFF',  // ライトブルー
  },

  // Grayscale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type PaletteColor = keyof typeof palette;
export type TierColor = keyof typeof palette.tier;

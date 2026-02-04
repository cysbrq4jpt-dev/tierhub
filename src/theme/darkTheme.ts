import { palette } from './colors';
import { lightTheme, Theme } from './lightTheme';

export const darkTheme: Theme = {
  colors: {
    // Background
    background: palette.gray[900],
    surface: palette.gray[800],
    card: palette.gray[800],

    // Text
    text: palette.gray[50],
    textSecondary: palette.gray[400],
    textDisabled: palette.gray[600],

    // Primary
    primary: palette.primary[400],
    primaryLight: palette.primary[800],
    primaryDark: palette.primary[200],

    // Border
    border: palette.gray[700],
    borderLight: palette.gray[800],

    // TIER（ダークモードでも同じ色を使用）
    tier: palette.tier,

    // Semantic
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Components
    tabBar: palette.gray[900],
    tabBarInactive: palette.gray[500],
    headerBackground: palette.gray[900],
    inputBackground: palette.gray[800],
  },

  shadows: lightTheme.shadows,
};

import { palette } from './colors';

export const lightTheme = {
  colors: {
    // Background
    background: palette.white,
    surface: palette.gray[50],
    card: palette.white,

    // Text
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textDisabled: palette.gray[400],

    // Primary
    primary: palette.primary[500],
    primaryLight: palette.primary[100],
    primaryDark: palette.primary[700],

    // Border
    border: palette.gray[200],
    borderLight: palette.gray[100],

    // TIER
    tier: palette.tier,

    // Semantic
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,

    // Components
    tabBar: palette.white,
    tabBarInactive: palette.gray[400],
    headerBackground: palette.white,
    inputBackground: palette.gray[100],
  },

  shadows: {
    sm: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export type Theme = typeof lightTheme;

import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useUIStore } from '@/stores/uiStore';
import { lightTheme, darkTheme, Theme } from '@/theme';

export const useTheme = () => {
  const { colorScheme, updateColorScheme } = useUIStore();

  useEffect(() => {
    // システムテーマ変更を監視
    const subscription = Appearance.addChangeListener(() => {
      updateColorScheme();
    });

    return () => subscription.remove();
  }, [updateColorScheme]);

  const theme: Theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDark = colorScheme === 'dark';

  return {
    theme,
    isDark,
    colorScheme,
  };
};

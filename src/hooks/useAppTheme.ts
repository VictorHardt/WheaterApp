import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { DarkColors, LightColors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme';

export function useAppTheme() {
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();

  const isDarkMode = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  const colors = isDarkMode ? DarkColors : LightColors;

  return {
    isDarkMode,
    colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
  };
}

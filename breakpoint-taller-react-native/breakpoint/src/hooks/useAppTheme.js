import { useColorScheme } from 'react-native';
import { palettes } from '../constants/theme';

// Adaptación claro/oscuro con useColorScheme de React Native.
export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { scheme: scheme ?? 'light', isDark, palette: isDark ? palettes.dark : palettes.light };
}

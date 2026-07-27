import { useThemeContext } from '@/contexts/theme-context';

export function useTheme() {
  const { theme } = useThemeContext();
  return theme;
}

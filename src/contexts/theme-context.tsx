import { createContext, useContext, useMemo, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { themeMap, type ThemeColors, type ThemeKey, darkTheme } from '@/constants/theme';
import { useThemePreference, useSetThemePreference, type ThemeMode } from '@/stores/use-preference-store';
import { supportsMaterialYou } from '@/utils/dynamic-colors';

interface ThemeContextValue {
  theme: ThemeColors;
  themeKey: ThemeKey;
  setThemeKey: (_key: ThemeKey) => void;
  resolvedThemeKey: ThemeKey;
  materialYouSupported: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function mapPreferenceToThemeKey(pref: string): ThemeKey {
  switch (pref) {
    case 'system': return 'system';
    case 'dark': return 'dark';
    case 'light': return 'light';
    case 'amoled': return 'amoled';
    case 'glass': return 'glass';
    case 'cyberpunk': return 'cyberpunk';
    case 'neon': return 'neon';
    case 'minimal': return 'minimal';
    default: return 'system';
  }
}

function mapThemeKeyToPreference(key: ThemeKey): string {
  if (['system', 'dark', 'light', 'amoled', 'glass', 'cyberpunk', 'neon', 'minimal'].includes(key)) {
    return key;
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const prefTheme = useThemePreference();
  const setPrefTheme = useSetThemePreference();
  const [materialYouSupported] = useState(() => supportsMaterialYou());

  const [themeKey, setThemeKeyState] = useState<ThemeKey>(() => {
    return mapPreferenceToThemeKey(prefTheme);
  });

  const resolvedThemeKey: ThemeKey =
    themeKey === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeKey;

  const theme = useMemo(() => {
    return themeMap[resolvedThemeKey] || darkTheme;
  }, [resolvedThemeKey]);

  const setThemeKey = useCallback(
    (key: ThemeKey) => {
      setThemeKeyState(key);
      setPrefTheme(mapThemeKeyToPreference(key) as ThemeMode);
    },
    [setPrefTheme],
  );

  useEffect(() => {
    const mapped = mapPreferenceToThemeKey(prefTheme);
    if (mapped !== themeKey) {
      setThemeKeyState(mapped);
    }
  }, [prefTheme]);

  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey, resolvedThemeKey, materialYouSupported }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: darkTheme,
      themeKey: 'dark',
      resolvedThemeKey: 'dark',
      setThemeKey: () => {},
      materialYouSupported: false,
    };
  }
  return ctx;
}

export { ThemeContext };

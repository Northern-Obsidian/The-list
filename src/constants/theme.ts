import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F0F1F3',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    textTertiary: '#9CA3AF',
    primary: '#3C9FFE',
    primaryLight: '#6BB5FF',
    primaryDark: '#0274DF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    modal: '#FFFFFF',
    sheet: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    overlay: 'rgba(0,0,0,0.3)',
    shadow: 'rgba(0,0,0,0.1)',
    tabBar: '#FFFFFF',
    tabBarInactive: '#9CA3AF',
    tabBarActive: '#3C9FFE',
    skeleton: '#E5E7EB',
    skeletonHighlight: '#F3F4F6',
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(255,255,255,0.8)',
    blur: 'rgba(255,255,255,0.8)',
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    backgroundTertiary: '#2A2A2A',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    textTertiary: '#6B7280',
    primary: '#3C9FFE',
    primaryLight: '#6BB5FF',
    primaryDark: '#0274DF',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    card: '#1E1E1E',
    cardElevated: '#2A2A2A',
    modal: '#1E1E1E',
    sheet: '#1E1E1E',
    border: '#2E3135',
    borderLight: '#3A3D42',
    overlay: 'rgba(0,0,0,0.6)',
    shadow: 'rgba(0,0,0,0.3)',
    tabBar: '#121212',
    tabBarInactive: '#6B7280',
    tabBarActive: '#3C9FFE',
    skeleton: '#2A2A2A',
    skeletonHighlight: '#3A3A3A',
    glass: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.12)',
    blur: 'rgba(18,18,18,0.8)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeKey = 'system' | 'light' | 'dark' | 'amoled' | 'glass' | 'cyberpunk' | 'neon' | 'minimal';

export type ThemeColors = {
  [_K in ThemeColor]: string;
};

const light: ThemeColors = Colors.light as unknown as ThemeColors;
const dark: ThemeColors = Colors.dark as unknown as ThemeColors;

export const lightTheme = light;
export const darkTheme = dark;

const amoled: ThemeColors = {
  ...dark,
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#0A0A0A',
  tabBar: '#000000',
  blur: 'rgba(0,0,0,0.85)',
};

const glass: ThemeColors = {
  ...light,
  background: '#F5F5F7',
  backgroundSecondary: 'rgba(255,255,255,0.1)',
  card: 'rgba(255,255,255,0.15)',
  cardElevated: 'rgba(255,255,255,0.2)',
  glass: 'rgba(255,255,255,0.2)',
  glassBorder: 'rgba(255,255,255,0.3)',
  blur: 'rgba(245,245,247,0.8)',
};

const cyberpunk: ThemeColors = {
  ...dark,
  background: '#0a0a1a',
  backgroundSecondary: '#0f0f2e',
  backgroundTertiary: '#1a1a3e',
  text: '#00ff88',
  textSecondary: '#00cc77',
  textTertiary: '#008855',
  primary: '#ff00ff',
  primaryLight: '#ff66ff',
  primaryDark: '#cc00cc',
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff0044',
};

const neon: ThemeColors = {
  ...dark,
  primary: '#00ffff',
  primaryLight: '#66ffff',
  primaryDark: '#00cccc',
  text: '#e0e0ff',
};

const minimal: ThemeColors = {
  ...light,
  primary: '#333333',
  primaryLight: '#666666',
  primaryDark: '#000000',
  backgroundElement: '#F5F5F5',
  backgroundSelected: '#E8E8E8',
};

export const themeMap: Record<ThemeKey, ThemeColors> = {
  system: dark,
  light,
  dark,
  amoled,
  glass,
  cyberpunk,
  neon,
  minimal,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
  eight: 96,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

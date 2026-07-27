# Theme & Styling Plan

## Core Philosophy

- **No NativeWind/Tailwind** — use `StyleSheet.create` for full control
- Platform-adaptive styling (iOS native feel, Material Design on Android)
- Theme is a first-class concern, not an afterthought
- Every component accepts `style` prop for overrides

## Theme Data Structure

```typescript
interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundElement: string;
  backgroundSelected: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Accent
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Surfaces
  card: string;
  cardElevated: string;
  modal: string;
  sheet: string;

  // Effects
  blur: string;          // backdrop-filter color
  overlay: string;       // modal overlays
  shadow: string;        // shadow color

  // Navigation
  tabBar: string;
  tabBarInactive: string;
  tabBarActive: string;

  // Borders
  border: string;
  borderLight: string;

  // Special
  skeleton: string;      // skeleton loader base
  skeletonHighlight: string; // skeleton shimmer
  glass: string;         // glassmorphism base
  glassBorder: string;  // glassmorphism border
}

interface ThemeSpacing {
  quarter: number;  // 1
  half: number;     // 2
  one: number;      // 4
  two: number;      // 8
  three: number;    // 12
  four: number;     // 16
  five: number;     // 24
  six: number;      // 32
  seven: number;    // 48
  eight: number;    // 64
}

interface ThemeTypography {
  display: FontStyle;    // 48px, heavy
  h1: FontStyle;         // 32px, bold
  h2: FontStyle;         // 28px, bold
  h3: FontStyle;         // 24px, semibold
  h4: FontStyle;         // 20px, semibold
  body: FontStyle;       // 16px, regular
  bodySmall: FontStyle;  // 14px, regular
  caption: FontStyle;    // 12px, regular
  label: FontStyle;      // 14px, medium
  button: FontStyle;     // 16px, semibold
  code: FontStyle;       // 12px, mono
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  radius: {
    sm: number;   // 6
    md: number;   // 10
    lg: number;   // 16
    xl: number;   // 24
    full: number; // 9999
  };
  shadows: {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
  };
  animation: {
    spring: SpringConfig;
    timing: TimingConfig;
    duration: {
      fast: number;   // 200ms
      normal: number; // 350ms
      slow: number;   // 500ms
    };
  };
}
```

## Theme Definitions

### Dark Theme
```typescript
const dark: ThemeColors = {
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2A2A2A',
  backgroundElement: '#212225',
  backgroundSelected: '#2E3135',
  text: '#FFFFFF',
  textSecondary: '#B0B4BA',
  textTertiary: '#6B7280',
  textInverse: '#000000',
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
  blur: 'rgba(18, 18, 18, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  tabBar: '#121212',
  tabBarInactive: '#6B7280',
  tabBarActive: '#3C9FFE',
  border: '#2E3135',
  borderLight: '#3A3D42',
  skeleton: '#2A2A2A',
  skeletonHighlight: '#3A3A3A',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
};
```

### AMOLED Theme
Same as Dark but with true black backgrounds:
```typescript
const amoled: ThemeColors = {
  ...dark,
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  card: '#0A0A0A',
  tabBar: '#000000',
  blur: 'rgba(0, 0, 0, 0.85)',
};
```

### Light Theme
```typescript
const light: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundTertiary: '#F0F1F3',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  text: '#000000',
  textSecondary: '#60646C',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
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
  blur: 'rgba(255, 255, 255, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  tabBar: '#FFFFFF',
  tabBarInactive: '#9CA3AF',
  tabBarActive: '#3C9FFE',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
  glass: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.8)',
};
```

### Glass Theme
Frosted glass effect across all surfaces:
```typescript
const glass: ThemeColors = {
  ...light,
  background: 'transparent',  // App wrapper has blur
  backgroundSecondary: 'rgba(255, 255, 255, 0.1)',
  card: 'rgba(255, 255, 255, 0.15)',
  cardElevated: 'rgba(255, 255, 255, 0.2)',
  glass: 'rgba(255, 255, 255, 0.2)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
};
// Requires backdropFilter: blur(20px) on root view
```

### Cyberpunk Theme
```typescript
const cyberpunk: ThemeColors = {
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
  // ...more neon colors
};
```

### Neon Theme
```typescript
const neon: ThemeColors = {
  ...dark,
  primary: '#00ffff',
  primaryLight: '#66ffff',
  primaryDark: '#00cccc',
  text: '#e0e0ff',
  // Cyan/purple accents on dark
};
```

### Minimal Theme
```typescript
const minimal: ThemeColors = {
  ...light,
  primary: '#333333',
  primaryLight: '#666666',
  primaryDark: '#000000',
  // Monochrome with minimal color
};
```

## Material You (Dynamic Colors)

On Android 12+, extract colors from wallpaper:
```typescript
import { getColors } from 'react-native-material-you';

async function getDynamicTheme(): Promise<Theme> {
  const palette = await getColors();
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: palette.accent1,
      primaryLight: palette.accent2,
      primaryDark: palette.accent3,
      background: palette.systemNeutral1,
      // Map Material You palette to theme colors
    },
  };
}
```

## Glassmorphism Components

### Glass Card
```typescript
import { GlassView } from 'expo-glass-effect';

function GlassCard({ children, style }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16,
        ...style,
      }}>
        {children}
      </div>
    );
  }
  return (
    <GlassView
      tint={theme.dark ? 'dark' : 'light'}
      intensity={40}
      style={[styles.glass, style]}
    >
      {children}
    </GlassView>
  );
}
```

## Shadow System

```typescript
const shadows = Platform.select({
  ios: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 6 },
    lg: { elevation: 12 },
  },
  web: {
    sm: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    md: { boxShadow: '0 4px 8px rgba(0,0,0,0.12)' },
    lg: { boxShadow: '0 8px 16px rgba(0,0,0,0.15)' },
  },
});
```

## Typography System

```typescript
const typography = {
  display: { fontSize: 48, lineHeight: 52, fontWeight: '700' as const },
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  h4: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  button: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  code: { fontSize: 12, lineHeight: 16, fontFamily: 'monospace' },
};
```

## Spacing Scale

Based on 4px grid:
```typescript
const spacing = {
  quarter: 1,
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
  eight: 64,
};
```

## Theme Provider Architecture

```typescript
// src/contexts/theme-context.tsx
function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeKey, setThemeKey] = useMMKVString('theme');
  const [dynamicColors, setDynamicColors] = useState(false);

  const resolvedTheme = useMemo(() => {
    let base: ThemeColors;
    switch (themeKey) {
      case 'dark': base = themes.dark; break;
      case 'amoled': base = themes.amoled; break;
      case 'light': base = themes.light; break;
      case 'glass': base = themes.glass; break;
      case 'cyberpunk': base = themes.cyberpunk; break;
      case 'neon': base = themes.neon; break;
      case 'minimal': base = themes.minimal; break;
      case 'system':
      default:
        base = systemScheme === 'dark' ? themes.dark : themes.light;
    }

    // Override with dynamic colors if enabled
    if (dynamicColors && dynamicPalette) {
      base = applyDynamicColors(base, dynamicPalette);
    }

    return base;
  }, [themeKey, systemScheme, dynamicColors, dynamicPalette]);

  return (
    <ThemeContext.Provider value={resolvedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## StyleSheet Organization

Every component follows this pattern:
```typescript
// components/ui/card.tsx
const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    // Common styles
  },
  elevated: {
    // Platform-specific shadows
  },
  outlined: {
    borderWidth: 1,
  },
  glass: {
    // Glass-specific styles
  },
});

function Card({ variant = 'elevated', style, children }) {
  const theme = useTheme();
  return (
    <View style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'outlined' && [styles.outlined, { borderColor: theme.border }],
      variant === 'glass' && styles.glass,
      { backgroundColor: theme.card },
      style,
    ]}>
      {children}
    </View>
  );
}
```

## Platform-Style Adaptation

```typescript
// src/utils/platform-styles.ts
const headerStyle = Platform.select({
  ios: {
    // Large title navigation bar
    fontSize: 34,
    fontWeight: '700',
  },
  android: {
    // Material Design 3 headline
    fontSize: 32,
    fontFamily: 'Google Sans',
    fontWeight: '500',
  },
  web: {
    fontSize: 32,
    fontWeight: '600',
  },
});

const safeArea = Platform.select({
  ios: { paddingTop: 44 }, // Notch
  android: { paddingTop: StatusBar.currentHeight },
  default: { paddingTop: 0 },
});
```

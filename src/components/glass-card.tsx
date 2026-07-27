import { Platform, StyleSheet, type ViewProps } from 'react-native';
import { GlassView } from 'expo-glass-effect';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Shadows } from '@/constants/shadows';
import { useTheme } from '@/hooks/use-theme';

export type GlassCardProps = ViewProps & {
  colorScheme?: 'auto' | 'light' | 'dark';
};

export function GlassCard({ colorScheme, style, children, ...rest }: GlassCardProps) {
  const theme = useTheme();

  if (Platform.OS === 'web') {
    return (
      <ThemedView
        style={[
          styles.base,
          {
            backgroundColor: theme.glass,
            borderColor: theme.glassBorder,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </ThemedView>
    );
  }

  return (
    <GlassView
      colorScheme={colorScheme ?? (theme.background === '#121212' || theme.background === '#000000' || theme.background === '#0a0a1a' ? 'dark' : 'light')}
      style={[styles.base, style]}
      {...rest}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    ...Shadows.sm,
  },
});

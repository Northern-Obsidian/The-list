import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  variant?: 'elevated' | 'outlined' | 'flat';
  onPress?: () => void;
  children: ReactNode;
};

export function Card({
  variant = 'elevated',
  onPress,
  children,
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();

  const borderColor =
    variant === 'outlined' ? theme.border : 'transparent';

  const content = (
    <ThemedView
      style={[
        styles.base,
        { borderColor, backgroundColor: theme.card },
        variant === 'elevated' && { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
      {...rest}
    >
      {children}
    </ThemedView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  elevated: {},
  outlined: {},
  flat: {
    boxShadow: 'none',
  },
  pressed: {
    opacity: 0.85,
  },
});

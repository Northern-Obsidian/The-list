import { type ComponentProps, type ReactNode, useCallback } from 'react';
import { Pressable, StyleSheet, type GestureResponderEvent, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';

export type ButtonProps = ComponentProps<typeof Pressable> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
};

export function Button({ variant = 'primary', children, style, disabled, onPress, ...rest }: ButtonProps) {
  const haptics = useHaptics();

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      haptics.light();
      onPress?.(e);
    },
    [haptics, onPress],
  );

  const bgType = variant === 'primary' ? 'backgroundElement' : undefined;

  return (
    <Pressable
      style={({ pressed }: { pressed: boolean }): ViewStyle[] => [
        styles.base,
        ...(variant === 'ghost' ? [styles.ghost] : []),
        ...(variant === 'primary' ? [styles.primary] : []),
        ...(variant === 'secondary' ? [styles.secondary] : []),
        ...(pressed ? [styles.pressed] : []),
        ...(disabled ? [styles.disabled] : []),
        style as ViewStyle,
      ]}
      disabled={disabled}
      onPress={handlePress}
      accessibilityRole="button"
      {...rest}>
      <ThemedView type={bgType} style={styles.inner}>
        <ThemedText
          type="smallBold"
          themeColor={variant === 'primary' ? 'text' : variant === 'ghost' ? 'textSecondary' : 'text'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Spacing.three,
  },
  primary: {},
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
  },
  ghost: {
    opacity: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  inner: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

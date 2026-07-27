import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';

export type IconButtonProps = {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
};

export function IconButton({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor,
}: IconButtonProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  const handlePress = useCallback(() => {
    haptics.light();
    onPress();
  }, [haptics, onPress]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: backgroundColor || 'transparent',
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
        },
        pressed && { opacity: 0.7 },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${icon} button`}
    >
      <ThemedText
        style={[
          styles.icon,
          { fontSize: size, color: color || theme.text },
        ]}
      >
        {icon}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.one,
  },
  icon: {
    textAlign: 'center',
  },
});

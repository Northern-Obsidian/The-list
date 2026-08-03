import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  fullWidth?: boolean;
};

export function Chip({ label, selected, onPress, color, fullWidth }: ChipProps) {
  const theme = useTheme();

  const bgColor = selected
    ? color || theme.primary
    : theme.backgroundElement;
  const textColor = selected ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        fullWidth && styles.chipFull,
        { backgroundColor: bgColor },
        pressed && !selected && { opacity: 0.7 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
    >
      {label ? (
        <ThemedText
          type="small"
          style={[styles.label, { color: textColor }]}
          numberOfLines={1}
        >
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  chipFull: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

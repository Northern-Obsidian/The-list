import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
};

export function Chip({ label, selected, onPress, color }: ChipProps) {
  const theme = useTheme();

  const bgColor = selected
    ? color || theme.primary
    : theme.backgroundElement;
  const textColor = selected ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bgColor },
        pressed && !selected && { opacity: 0.7 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
    >
      <ThemedText
        type="small"
        style={[styles.label, { color: textColor }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  label: {
    fontWeight: '500',
  },
});

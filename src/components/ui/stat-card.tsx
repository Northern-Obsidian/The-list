import { StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatCardProps = {
  value: string | number;
  label: string;
  icon?: string;
  style?: ViewStyle;
};

export function StatCard({ value, label, icon, style }: StatCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.container, style]}>
      {icon ? <Icon name={icon} size={20} color={theme.textSecondary} /> : null}
      <ThemedText style={[styles.value, { color: theme.text }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
});

import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';

export type MenuListItemProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  badge?: string;
  danger?: boolean;
  style?: ViewStyle;
};

export function MenuListItem({ icon, label, onPress, badge, danger, style }: MenuListItemProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  const iconColor = danger ? theme.error : theme.textSecondary;
  const labelColor = danger ? theme.error : theme.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      accessibilityRole="button"
    >
      <Icon name={icon as IconName} size={20} color={iconColor} />
      <ThemedText style={[styles.label, { color: labelColor }]}>
        {label}
      </ThemedText>
      {badge ? (
        <ThemedText
          style={[
            styles.badge,
            {
              backgroundColor: theme.backgroundElement,
              color: theme.textSecondary,
            },
          ]}
        >
          {badge}
        </ThemedText>
      ) : (
        <Icon name="chevron-right" size={16} color={theme.textTertiary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.three,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    flex: 1,
    fontSize: 15,
  },
  badge: {
    fontSize: 12,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    overflow: 'hidden',
  },
});

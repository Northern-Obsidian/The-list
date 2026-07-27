import { View, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeProps = ViewProps & {
  label: string;
  variant?: 'filled' | 'outlined' | 'dot';
  color?: string;
  size?: 'sm' | 'md';
};

export function Badge({ label, variant = 'filled', color, size = 'sm', style, ...rest }: BadgeProps) {
  const theme = useTheme();
  const bgColor = color || theme.primary;
  const isDot = variant === 'dot';

  if (isDot) {
    return <View style={[{ width: size === 'sm' ? 8 : 10, height: size === 'sm' ? 8 : 10, borderRadius: 5, backgroundColor: bgColor }, style]} {...rest} />;
  }

  return (
    <View
      style={[
        {
          paddingHorizontal: size === 'sm' ? Spacing.two : Spacing.three,
          paddingVertical: size === 'sm' ? 2 : 4,
          borderRadius: Spacing.two,
          backgroundColor: variant === 'filled' ? bgColor : 'transparent',
          borderColor: variant === 'outlined' ? bgColor : 'transparent',
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
      ]}
      {...rest}
    >
      <ThemedText
        type="small"
        style={[
          { fontSize: size === 'sm' ? 11 : 12, fontWeight: '600' },
          variant === 'filled' ? { color: '#FFF' } : { color: bgColor },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

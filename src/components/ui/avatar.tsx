import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export type AvatarProps = ViewProps & {
  emoji?: string;
  name?: string;
  size?: number;
};

export function Avatar({ emoji, name, size = 48, style, ...rest }: AvatarProps) {
  const theme = useTheme();

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.backgroundElement,
        },
        style,
      ]}
      {...rest}
    >
      <ThemedText style={[styles.text, { fontSize: size * 0.4 }]}>
        {emoji || initials}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { justifyContent: 'center', alignItems: 'center' },
  text: { fontWeight: '600' },
});

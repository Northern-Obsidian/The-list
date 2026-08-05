import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  style?: ViewStyle;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search movies, series, people...',
  onFilterPress,
  style,
}: SearchBarProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundElement },
        style,
      ]}
    >
      <Icon name="search" size={18} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
      />
      {value.length > 0 && (
        <Pressable
          style={styles.clearButton}
          onPress={() => {
            haptics.light();
            onChangeText('');
          }}
        >
          <Icon name="x" size={16} color={theme.textSecondary} />
        </Pressable>
      )}
      {onFilterPress && (
        <Pressable
          style={styles.filterButton}
          onPress={() => {
            haptics.light();
            onFilterPress();
          }}
        >
          <Icon name="adjustments" size={18} color={theme.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  clearButton: {
    padding: Spacing.one,
  },
  filterButton: {
    padding: Spacing.one,
  },
});

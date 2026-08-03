import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  showClear?: boolean;
  characterCount?: boolean;
  maxLength?: number;
};

export function Input({
  label,
  error,
  showClear,
  characterCount,
  value,
  onChangeText,
  style,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.label}
        >
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error
              ? theme.error
              : focused
              ? theme.primary
              : 'transparent',
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            rest.multiline && styles.multiline,
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {showClear && value && onChangeText && (
          <Pressable
            style={styles.clearButton}
            onPress={() => onChangeText('')}
          >
            <Icon name="x" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>
      {error && (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          {error}
        </ThemedText>
      )}
      {characterCount && rest.maxLength && (
        <ThemedText
          type="small"
          themeColor="textTertiary"
          style={styles.count}
        >
          {value?.length ?? 0}/{rest.maxLength}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.half,
  },
  label: {
    marginLeft: Spacing.one,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    borderCurve: 'continuous',
    borderWidth: 2,
    paddingHorizontal: Spacing.four,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  multiline: {
    height: 120,
    paddingTop: Spacing.three,
    textAlignVertical: 'top',
  },
  clearButton: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  errorText: {
    fontSize: 12,
    marginLeft: Spacing.one,
  },
  count: {
    textAlign: 'right',
    marginRight: Spacing.one,
  },
});

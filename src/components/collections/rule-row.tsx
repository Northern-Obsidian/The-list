import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/input';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SmartRule } from '@/types/collections';
import {
  RULE_FIELDS,
  RULE_OPERATORS,
  FIELD_LABELS,
  OPERATOR_LABELS,
  MEDIA_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '@/types/collections';

type Props = {
  rule: SmartRule;
  index: number;
  onChange: (_index: number, _rule: SmartRule) => void;
  onRemove: (_index: number) => void;
};

export function RuleRow({ rule, index, onChange, onRemove }: Props) {
  const theme = useTheme();

  const needsValue = !['is_empty', 'is_not_empty'].includes(rule.operator);
  const needsTextInput = !['mediaType', 'status'].includes(rule.field) || ['contains', 'not_contains'].includes(rule.operator);

  const getValueOptions = () => {
    if (rule.field === 'mediaType') return MEDIA_TYPE_OPTIONS;
    if (rule.field === 'status') return STATUS_OPTIONS;
    return null;
  };

  const options = getValueOptions();
  const showValue2 = rule.operator === 'between';

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          Rule {index + 1}
        </ThemedText>
        <Pressable onPress={() => onRemove(index)}>
          <ThemedText type="small" style={{ color: theme.error || '#F87171' }}>
            Remove
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.row}>
        <View style={styles.fieldSelect}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            Field
          </ThemedText>
          <ThemedView style={styles.optionsRow}>
            {RULE_FIELDS.map((f) => (
              <Pressable
                key={f}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: rule.field === f ? theme.backgroundSelected : theme.background,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => onChange(index, { ...rule, field: f, value: '', value2: '' })}
              >
                <ThemedText type="small">{FIELD_LABELS[f]}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </View>
      </ThemedView>

      <ThemedView style={styles.row}>
        <View style={styles.operatorSelect}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            Condition
          </ThemedText>
          <ThemedView style={styles.optionsRow}>
            {RULE_OPERATORS.map((op) => (
              <Pressable
                key={op}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: rule.operator === op ? theme.backgroundSelected : theme.background,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => onChange(index, { ...rule, operator: op, value: '', value2: '' })}
              >
                <ThemedText type="small">{OPERATOR_LABELS[op]}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </View>
      </ThemedView>

      {needsValue && options && (
        <ThemedView style={styles.row}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            Value
          </ThemedText>
          <ThemedView style={styles.optionsRow}>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: rule.value === opt.value ? theme.backgroundSelected : theme.background,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => onChange(index, { ...rule, value: opt.value })}
              >
                <ThemedText type="small">{opt.label}</ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>
      )}

      {needsValue && needsTextInput && !options && (
        <ThemedView style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input
              label="Value"
              value={rule.value}
              onChangeText={(v) => onChange(index, { ...rule, value: v })}
              placeholder="Enter value"
            />
          </View>
          {showValue2 && (
            <View style={{ flex: 1 }}>
              <Input
                label="and"
                value={rule.value2 || ''}
                onChangeText={(v) => onChange(index, { ...rule, value2: v })}
                placeholder="max value"
              />
            </View>
          )}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    gap: Spacing.one,
  },
  label: {
    marginBottom: Spacing.one,
  },
  fieldSelect: {},
  operatorSelect: {},
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  option: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});

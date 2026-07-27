import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { RuleRow } from './rule-row';
import type { SmartRules, SmartRule, RuleGroup } from '@/types/collections';

type Props = {
  rules: SmartRules;
  onChange: (_rules: SmartRules) => void;
};

function createEmptyRule(): SmartRule {
  return { field: 'mediaType', operator: 'equals', value: 'movie' };
}

export function RuleBuilder({ rules, onChange }: Props) {
  const theme = useTheme();

  const addRule = () => {
    onChange({
      ...rules,
      rules: [...rules.rules, createEmptyRule()],
    });
  };

  const updateRule = (index: number, rule: SmartRule) => {
    const updated = [...rules.rules];
    updated[index] = rule;
    onChange({ ...rules, rules: updated });
  };

  const removeRule = (index: number) => {
    onChange({
      ...rules,
      rules: rules.rules.filter((_, i) => i !== index),
    });
  };

  const toggleGroup = (group: RuleGroup) => {
    onChange({ ...rules, group });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.groupToggle}>
        <ThemedText type="small" themeColor="textSecondary">
          Match
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.groupOption,
            {
              backgroundColor: rules.group === 'all' ? theme.backgroundSelected : theme.background,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => toggleGroup('all')}
        >
          <ThemedText type="small">ALL</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.groupOption,
            {
              backgroundColor: rules.group === 'any' ? theme.backgroundSelected : theme.background,
            },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => toggleGroup('any')}
        >
          <ThemedText type="small">ANY</ThemedText>
        </Pressable>
        <ThemedText type="small" themeColor="textSecondary">
          of the following rules
        </ThemedText>
      </ThemedView>

      {rules.rules.map((rule, index) => (
        <RuleRow
          key={index}
          rule={rule}
          index={index}
          onChange={updateRule}
          onRemove={removeRule}
        />
      ))}

      <Button variant="secondary" onPress={addRule}>
        + Add Rule
      </Button>

      {rules.rules.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.preview}>
          <ThemedText type="small" themeColor="textSecondary">
            Preview: {rules.rules.length} rule{rules.rules.length !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  groupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  groupOption: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  preview: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});

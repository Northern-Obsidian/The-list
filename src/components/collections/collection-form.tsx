import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RuleBuilder } from '@/components/collections/rule-builder';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { eq } from 'drizzle-orm';
import { getDatabase, getActiveProfileId } from '@/db';
import { collections } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import { validateCollectionForm } from '@/utils/validation';
import type { CollectionFormData } from '@/types/media';
import type { SmartRules } from '@/types/collections';

const COLOR_OPTIONS = [
  '#3C9FFE', '#34D399', '#FBBF24', '#F87171',
  '#A78BFA', '#F472B6', '#FB923C', '#2DD4BF',
];

const ICON_OPTIONS = ['📁', '🎬', '📺', '📖', '🎮', '🎵', '⭐', '❤️'];

export type CollectionFormProps = {
  initialData?: Partial<CollectionFormData> & { id?: string };
  onSave: () => void;
  onCancel: () => void;
};

function defaultSmartRules(): SmartRules {
  return { group: 'all', rules: [{ field: 'mediaType', operator: 'equals', value: 'movie' }] };
}

export function CollectionForm({ initialData, onSave, onCancel }: CollectionFormProps) {
  const theme = useTheme();
  const [form, setForm] = useState<CollectionFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    color: initialData?.color || COLOR_OPTIONS[0],
    icon: initialData?.icon || ICON_OPTIONS[0],
    isSmart: initialData?.isSmart || false,
    smartRules: initialData?.smartRules || defaultSmartRules(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = useCallback(
    <K extends keyof CollectionFormData>(key: K, value: CollectionFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const validation = validateCollectionForm(form);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    try {
      const { db } = getDatabase();
      const now = new Date().toISOString();
      if (initialData?.id) {
        db.update(collections)
          .set({
            name: form.name,
            description: form.description || null,
            color: form.color || null,
            icon: form.icon || null,
            isSmart: form.isSmart,
            smartRules: form.isSmart && form.smartRules ? JSON.stringify(form.smartRules) : null,
            updatedAt: now,
          })
          .where(eq(collections.id, initialData.id))
          .run();
      } else {
        db.insert(collections)
          .values({
            id: generateId(),
            profileId: getActiveProfileId(),
            name: form.name,
            description: form.description || null,
            color: form.color || null,
            icon: form.icon || null,
            isSmart: form.isSmart,
            smartRules: form.isSmart && form.smartRules ? JSON.stringify(form.smartRules) : null,
            sortOrder: 0,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
      onSave();
    } catch {
      setErrors({ name: 'Failed to save collection' });
    } finally {
      setSaving(false);
    }
  }, [form, initialData?.id, onSave]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.form}>
        <Input
          label="Name *"
          value={form.name}
          onChangeText={(v) => update('name', v)}
          placeholder="Collection name"
          error={errors.name}
          autoFocus
        />

        <Input
          label="Description"
          value={form.description || ''}
          onChangeText={(v) => update('description', v)}
          placeholder="Optional description"
          multiline
        />

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            Collection Type
          </ThemedText>
          <View style={styles.typeRow}>
            <Pressable
              style={({ pressed }) => [
                styles.typeOption,
                {
                  backgroundColor: !form.isSmart ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: !form.isSmart ? theme.primary : 'transparent',
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => update('isSmart', false)}
            >
              <ThemedText type="smallBold">Manual</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Add items by hand
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.typeOption,
                {
                  backgroundColor: form.isSmart ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: form.isSmart ? theme.primary : 'transparent',
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => update('isSmart', true)}
            >
              <ThemedText type="smallBold">Smart</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Auto-filled by rules
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        {form.isSmart && form.smartRules && (
          <ThemedView style={styles.fieldGroup}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              Rules
            </ThemedText>
            <RuleBuilder
              rules={form.smartRules}
              onChange={(rules) => update('smartRules', rules)}
            />
          </ThemedView>
        )}

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            Color
          </ThemedText>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <View
                key={c}
                style={[styles.colorSwatch, { backgroundColor: c }]}
              >
                <Chip
                  label=""
                  selected={form.color === c}
                  onPress={() => update('color', c)}
                />
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            Icon
          </ThemedText>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((ic) => (
              <Chip
                key={ic}
                label={ic}
                selected={form.icon === ic}
                onPress={() => update('icon', ic)}
              />
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </Button>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  form: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  fieldGroup: { gap: Spacing.two },
  fieldLabel: { marginLeft: Spacing.one },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  typeOption: {
    flex: 1,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 2,
    gap: Spacing.one,
    alignItems: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  colorSwatch: {
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  actionButton: { flex: 1 },
});

import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { profiles } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import { validateProfileForm } from '@/utils/validation';
import type { ProfileFormData } from '@/types/media';

export type ProfileFormProps = {
  initialData?: Partial<ProfileFormData>;
  onSave: () => void;
  onCancel: () => void;
};

export function ProfileForm({ initialData, onSave, onCancel }: ProfileFormProps) {
  const theme = useTheme();
  const [form, setForm] = useState<ProfileFormData>({
    name: initialData?.name || '',
    avatar: initialData?.avatar || '',
    isGuest: initialData?.isGuest || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = useCallback(
    <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
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
    const validation = validateProfileForm(form);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    try {
      const { db } = getDatabase();
      const now = new Date().toISOString();
      db.insert(profiles)
        .values({
          id: generateId(),
          name: form.name,
          avatar: form.avatar || null,
          isActive: false,
          isGuest: form.isGuest,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      onSave();
    } catch {
      setErrors({ name: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  }, [form, onSave]);

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
          placeholder="Profile name"
          error={errors.name}
          autoFocus
        />

        <Input
          label="Avatar Emoji"
          value={form.avatar || ''}
          onChangeText={(v) => update('avatar', v)}
          placeholder="e.g. 🎬"
          maxLength={2}
        />

        <ThemedView style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? 'Saving...' : initialData ? 'Update' : 'Create Profile'}
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  actionButton: { flex: 1 },
});

import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { reviews } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import { validateReviewForm } from '@/utils/validation';
import type { ReviewFormData } from '@/types/media';

export type ReviewFormProps = {
  mediaId: string;
  initialData?: Partial<ReviewFormData>;
  onSave: () => void;
  onCancel: () => void;
};

export function ReviewForm({ mediaId, initialData, onSave, onCancel }: ReviewFormProps) {
  const theme = useTheme();
  const [form, setForm] = useState<ReviewFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    isSpoiler: initialData?.isSpoiler || false,
    favoriteScene: initialData?.favoriteScene || '',
    quotes: initialData?.quotes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = useCallback(
    <K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) => {
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
    const validation = validateReviewForm(form);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    try {
      const { db } = getDatabase();
      const now = new Date().toISOString();
      db.insert(reviews)
        .values({
          id: generateId(),
          mediaId,
          profileId: getActiveProfileId(),
          title: form.title || null,
          content: form.content,
          isSpoiler: form.isSpoiler,
          favoriteScene: form.favoriteScene || null,
          quotes: form.quotes || null,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      onSave();
    } catch {
      setErrors({ content: 'Failed to save review' });
    } finally {
      setSaving(false);
    }
  }, [form, mediaId, onSave]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.form}>
        <Input
          label="Title"
          value={form.title || ''}
          onChangeText={(v) => update('title', v)}
          placeholder="Review title (optional)"
        />

        <Input
          label="Review *"
          value={form.content}
          onChangeText={(v) => update('content', v)}
          placeholder="Write your review..."
          multiline
          characterCount
          maxLength={5000}
          error={errors.content}
          autoFocus
        />

        <Pressable
          style={({ pressed }) => [
            styles.spoilerToggle,
            { backgroundColor: theme.backgroundElement },
            form.isSpoiler && { backgroundColor: theme.warning },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => update('isSpoiler', !form.isSpoiler)}
          accessibilityRole="switch"
          accessibilityState={{ checked: form.isSpoiler }}
          accessibilityLabel={form.isSpoiler ? 'Contains spoilers' : 'Mark as spoiler-free'}
        >
          <ThemedText>
            {form.isSpoiler ? '⚠️ Contains Spoilers' : 'Mark as Spoiler-Free'}
          </ThemedText>
        </Pressable>

        <Input
          label="Favorite Scene"
          value={form.favoriteScene || ''}
          onChangeText={(v) => update('favoriteScene', v)}
          placeholder="Describe your favorite scene"
          multiline
        />

        <Input
          label="Favorite Quotes"
          value={form.quotes || ''}
          onChangeText={(v) => update('quotes', v)}
          placeholder="Memorable quotes"
          multiline
        />

        <ThemedView style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? 'Saving...' : 'Save Review'}
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
  spoilerToggle: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  actionButton: { flex: 1 },
});

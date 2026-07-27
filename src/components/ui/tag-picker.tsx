import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { tags, mediaTags } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type TagPickerTag = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  selectedIds: string[];
  onToggle: (_tagId: string) => void;
  mediaId?: string;
};

export function TagPicker({ selectedIds, onToggle, mediaId }: Props) {
  const theme = useTheme();
  const [allTags, setAllTags] = useState<TagPickerTag[]>([]);

  useEffect(() => {
    const { db } = getDatabase();
    const rows = db.select().from(tags).all();
    setAllTags(rows.map((t) => ({ id: t.id, name: t.name, color: t.color })));
  }, []);

  useEffect(() => {
    if (!mediaId) return;
    const { db } = getDatabase();
    const joins = db.select().from(mediaTags).where(eq(mediaTags.mediaId, mediaId)).all();
    const taggedIds = joins.map((j) => j.tagId);
    for (const tid of taggedIds) {
      if (!selectedIds.includes(tid)) onToggle(tid);
    }
  }, [mediaId]);

  if (allTags.length === 0) return null;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        Tags
      </ThemedText>
      <View style={styles.row}>
        {allTags.map((tag) => {
          const selected = selectedIds.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: selected ? tag.color : theme.backgroundElement,
                  borderColor: tag.color,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onToggle(tag.id)}
              accessibilityRole="button"
              accessibilityLabel={`Tag ${tag.name}${selected ? ', selected' : ''}`}
              accessibilityState={{ selected }}
            >
              <ThemedText
                type="small"
                style={[styles.chipLabel, selected && { color: '#FFFFFF' }]}
              >
                {tag.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  label: { marginLeft: Spacing.one },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: { fontWeight: '500' },
});

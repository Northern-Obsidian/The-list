import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { media, tags } from '@/db/schema';
import { getTagById, getMediaIdsForTag } from '@/db/queries';

interface TagWithItems {
  tag: typeof tags.$inferSelect;
  items: (typeof media.$inferSelect)[];
}

export default function TagDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [data, setData] = useState<TagWithItems | null>(null);

  useEffect(() => {
    if (!id) return;
    const { db } = getDatabase();
    const tag = getTagById(id);
    if (!tag) return;

    const itemIds = getMediaIdsForTag(id);
    const items = itemIds.length > 0
      ? db.select().from(media).all().filter((m) => itemIds.includes(m.id))
      : [];

    setData({ tag, items });
  }, [id]);

  const renderItem = useCallback(
    ({ item }: { item: typeof media.$inferSelect }) => (
      <Pressable
        style={({ pressed }) => [
          styles.itemCard,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push(`/media/${item.id}`)}
      >
        <ThemedText type="smallBold">{item.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.mediaType.replace(/_/g, ' ')} · {item.year || ''} · {item.status.replace(/_/g, ' ')}
        </ThemedText>
      </Pressable>
    ),
    [theme],
  );

  if (!data) {
    return <ScreenLoader />;
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Back</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{data.tag.name}</ThemedText>
        <View style={{ width: 50 }} />
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        {data.items.length} item{data.items.length !== 1 ? 's' : ''}
      </ThemedText>

      <FlatList
        data={data.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText themeColor="textSecondary">No items with this tag</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.four },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.six },
  itemCard: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.half },
  emptyState: { paddingVertical: Spacing.six, alignItems: 'center' },
});

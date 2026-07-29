import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MediaCard, type MediaCardItem } from '@/components/media/media-card';
import { Icon } from '@/components/ui/icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { getDatabase } from '@/db';
import { media, collections } from '@/db/schema';
import { getCollectionById, getMediaIdsForCollection } from '@/db/queries';
import { getSmartCollectionMedia } from '@/services/smart-collection-engine';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [collection, setCollection] = useState<(typeof collections.$inferSelect) | null>(null);
  const [items, setItems] = useState<MediaCardItem[]>([]);

  useEffect(() => {
    if (!id) return;
    const { db } = getDatabase();
    const col = getCollectionById(id);
    if (!col) return;
    setCollection(col);

    let mediaItems: typeof media.$inferSelect[];
    if (col.isSmart) {
      mediaItems = getSmartCollectionMedia(id);
    } else {
      const ids = getMediaIdsForCollection(id);
      mediaItems = db.select().from(media).all().filter((m) => ids.includes(m.id));
    }

    setItems(
      mediaItems.map((m) => ({
        id: m.id,
        title: m.title,
        mediaType: m.mediaType,
        status: m.status,
        year: m.year,
        personalRating: m.personalRating,
        genres: m.genres,
        posterPath: m.posterPath,
      })),
    );
  }, [id]);

  const renderItem = useCallback(
    ({ item }: { item: MediaCardItem }) => <MediaCard item={item} variant="list" />,
    [],
  );

  if (!collection) {
    return <ScreenLoader />;
  }

  return (
    <ErrorBoundary name="CollectionDetailScreen">
    <FlatList
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + BottomTabInset + Spacing.three },
      ]}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedView style={[styles.header, { paddingTop: insets.top }]}>
          <ThemedView style={styles.headerBar}>
            <Pressable onPress={() => router.back()}>
              <ThemedText type="link">Back</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push(`/collections/${id}/edit`)}>
              <ThemedText type="link">Edit</ThemedText>
            </Pressable>
          </ThemedView>
          <ThemedView style={styles.collectionInfo}>
            <Icon name={collection.icon || 'folder'} size={48} color={theme.text} />
            <ThemedText type="subtitle">{collection.name}</ThemedText>
            {collection.description && (
              <ThemedText themeColor="textSecondary">{collection.description}</ThemedText>
            )}
            <ThemedText type="small" themeColor="textSecondary">
              {items.length} item{items.length !== 1 ? 's' : ''}
              {collection.isSmart ? ' · Smart Collection' : ''}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedView style={styles.emptyState}>
          <ThemedText themeColor="textSecondary">
            {collection.isSmart
              ? 'No media matches the smart rules'
              : 'This collection is empty'}
          </ThemedText>
        </ThemedView>
      }
      showsVerticalScrollIndicator={false}
    />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  header: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%', gap: Spacing.four, paddingBottom: Spacing.four },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.three },
  collectionInfo: { alignItems: 'center', gap: Spacing.two, paddingBottom: Spacing.three },
  collectionIcon: { fontSize: 48 },
  emptyState: { paddingVertical: Spacing.six, alignItems: 'center' },
});

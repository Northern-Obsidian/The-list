import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { collections } from '@/db/schema';
import { getCollectionsWithCounts } from '@/db/queries';

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [collectionList, setCollectionList] = useState<(typeof collections.$inferSelect & { itemCount: number })[]>([]);

  useEffect(() => {
    setCollectionList(getCollectionsWithCounts());
  }, []);

  const renderItem = ({ item }: { item: typeof collectionList[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.collectionCard,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => router.push(`/collections/${item.id}`)}
    >
      <Icon name={item.icon || 'folder'} size={32} color={theme.text} />
      <ThemedView style={styles.collectionInfo}>
        <ThemedText type="smallBold">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
          {item.isSmart ? ' · Smart' : ''}
        </ThemedText>
      </ThemedView>
      <Icon name="chevron.right" size={14} color={theme.text} />
    </Pressable>
  );

  return (
    <FlatList
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
      data={collectionList}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
          <ThemedView style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <ThemedText type="link">Back</ThemedText>
            </Pressable>
            <ThemedText type="subtitle">Collections</ThemedText>
            <Pressable onPress={() => router.push('/collections/new')}>
              <ThemedText type="link">Create</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedView style={styles.emptyState}>
          <Icon name="folder" size={64} color={theme.textSecondary} />
          <ThemedText themeColor="textSecondary">
            No collections yet. Create your first collection to organize your library.
          </ThemedText>
        </ThemedView>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyState: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  emptyIcon: { fontSize: 64 },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  collectionIcon: { fontSize: 32 },
  collectionInfo: { flex: 1, gap: Spacing.half },
});

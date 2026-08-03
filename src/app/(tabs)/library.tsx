import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { AnimatedList } from '@/components/animated-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LIST_OPTIMIZATION_PROPS } from '@/utils/performance';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';

const VIEW_MODES = ['grid', 'list'] as const;
const SORT_OPTIONS = [
  { key: 'title', label: 'Title' },
  { key: 'year', label: 'Year' },
  { key: 'rating', label: 'Rating' },
  { key: 'recent', label: 'Recent' },
];
const TYPE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv_show', label: 'TV Shows' },
  { key: 'anime', label: 'Anime' },
  { key: 'book', label: 'Books' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('title');
  const [typeFilter, setTypeFilter] = useState('');
  const [items, setItems] = useState<(typeof media.$inferSelect)[]>([]);
  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  useFocusEffect(
    useCallback(() => {
      const { db } = getDatabase();
      const allItems = db.select().from(media).all();
      setItems(allItems);
    }, [])
  );

  const sortedAndFiltered = useMemo(() => {
    let result = [...items];
    if (typeFilter) {
      result = result.filter((i) => i.mediaType === typeFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'rating':
          return (b.personalRating || 0) - (a.personalRating || 0);
        case 'recent':
          return b.updatedAt.localeCompare(a.updatedAt);
        default:
          return 0;
      }
    });
    return result;
  }, [items, typeFilter, sortBy]);

  const renderItem = useCallback(
    (item: typeof media.$inferSelect, _index: number) => (
      <Pressable
        style={({ pressed }) => [
          viewMode === 'list' ? styles.listItem : styles.gridItem,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push(`/media/${item.id}`)}
      >
        <ThemedText type={viewMode === 'list' ? 'smallBold' : 'small'} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {item.mediaType.replace(/_/g, ' ')} {item.year ? `· ${item.year}` : ''}
        </ThemedText>
        {item.personalRating && (
          <ThemedText type="small" themeColor="textSecondary">
            ⭐ {item.personalRating}
          </ThemedText>
        )}
      </Pressable>
    ),
    [theme, viewMode],
  );

  const renderEmpty = useCallback(
    () => (
      <ThemedView style={styles.emptyState}>
        <ThemedText type="subtitle" style={styles.emptyIcon}>📚</ThemedText>
        <ThemedText type="title" style={styles.emptyTitle}>
          Your library is empty
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.emptyText}>
          Start adding movies, shows, anime, and more to build your collection.
        </ThemedText>
      </ThemedView>
    ),
    [],
  );

  return (
    <ErrorBoundary name="LibraryScreen">
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.content, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Library</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {sortedAndFiltered.length} items
          </ThemedText>
          <ThemedView style={styles.headerActions}>
            {VIEW_MODES.map((mode) => (
              <Pressable
                key={mode}
                style={({ pressed }) => [
                  styles.viewToggle,
                  { backgroundColor: viewMode === mode ? theme.backgroundSelected : 'transparent' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Icon name={mode === 'grid' ? 'layout-grid' : 'list'} size={16} color={viewMode === mode ? theme.text : theme.textSecondary} />
              </Pressable>
            ))}
          </ThemedView>
        </ThemedView>

        <View style={styles.filterRow}>
          {TYPE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: typeFilter === f.key ? theme.backgroundSelected : theme.backgroundElement,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setTypeFilter(f.key)}
            >
              <ThemedText type="small" themeColor={typeFilter === f.key ? 'text' : 'textSecondary'}>
                {f.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedView style={styles.sortRow}>
          <ThemedText type="small" themeColor="textSecondary">Sort by:</ThemedText>
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={({ pressed }) => [
                styles.sortChip,
                { backgroundColor: sortBy === opt.key ? theme.backgroundSelected : theme.backgroundElement },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setSortBy(opt.key)}
            >
              <ThemedText type="small" themeColor={sortBy === opt.key ? 'text' : 'textSecondary'}>
                {opt.label}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>

        <AnimatedList
          data={sortedAndFiltered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: paddingBottom + Spacing.four },
          ]}
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          staggerDelay={60}
          {...LIST_OPTIMIZATION_PROPS}
        />
      </ThemedView>
    </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  headerActions: { flexDirection: 'row', gap: Spacing.half },
  viewToggle: { width: 36, height: 36, borderRadius: Spacing.two, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.two, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 20 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginBottom: Spacing.three },
  sortChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Spacing.three },
  listContent: { flexGrow: 1, gap: Spacing.two },
  gridRow: { gap: Spacing.two },
  listItem: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.half },
  gridItem: { flex: 1, padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.half },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: Spacing.six, gap: Spacing.three },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 24, textAlign: 'center' },
  emptyText: { textAlign: 'center', paddingHorizontal: Spacing.four },
});

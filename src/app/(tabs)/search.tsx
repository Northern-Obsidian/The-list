import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fuzzySearch } from '@/services/fuzzy-search';
import { getDatabase } from '@/db';
import { media, mediaTags } from '@/db/schema';
import { getAllTags } from '@/db/queries';
import { MediaCard, type MediaCardItem } from '@/components/media/media-card';

const MEDIA_TYPES = [
  { key: '', label: 'All' },
  { key: 'movie', label: 'Movie' },
  { key: 'tv_show', label: 'TV Show' },
  { key: 'anime', label: 'Anime' },
  { key: 'documentary', label: 'Doc' },
  { key: 'book', label: 'Book' },
  { key: 'podcast', label: 'Podcast' },
  { key: 'game', label: 'Game' },
];

const STATUSES = [
  { key: '', label: 'All' },
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'paused', label: 'Paused' },
  { key: 'dropped', label: 'Dropped' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<MediaCardItem[]>([]);
  const [allTags, setAllTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const [mediaTagMap, setMediaTagMap] = useState<Record<string, string[]>>({});
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  useEffect(() => {
    const { db } = getDatabase();
    const results = db.select().from(media).all();
    setAllItems(
      results.map((r) => ({
        id: r.id,
        title: r.title,
        mediaType: r.mediaType,
        status: r.status,
        year: r.year,
        personalRating: r.personalRating,
        genres: r.genres,
        posterPath: r.posterPath,
      })),
    );

    const tagRows = getAllTags();
    setAllTags(tagRows.map((t) => ({ id: t.id, name: t.name, color: t.color })));

    const joins = db.select().from(mediaTags).all();
    const map: Record<string, string[]> = {};
    for (const j of joins) {
      if (!map[j.mediaId]) map[j.mediaId] = [];
      map[j.mediaId].push(j.tagId);
    }
    setMediaTagMap(map);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const filtered = useMemo(() => {
    let items = allItems;

    if (selectedType) {
      items = items.filter((i) => i.mediaType === selectedType);
    }
    if (selectedStatus) {
      items = items.filter((i) => i.status === selectedStatus);
    }

    if (selectedTagIds.length > 0) {
      items = items.filter((i) => {
        const itemTags = mediaTagMap[i.id] || [];
        return selectedTagIds.some((tid) => itemTags.includes(tid));
      });
    }

    if (debouncedQuery.trim()) {
      items = fuzzySearch(items, debouncedQuery, {
        threshold: 0.15,
        keys: ['title', 'genres', 'mediaType'],
      });
    }

    return items;
  }, [debouncedQuery, selectedType, selectedStatus, selectedTagIds, allItems, mediaTagMap]);

  const resultsLabel = useMemo(() => {
    if (!debouncedQuery.trim() && !selectedType && !selectedStatus) {
      return 'Browse your library';
    }
    return `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
  }, [filtered.length, debouncedQuery, selectedType, selectedStatus]);

  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedType('');
    setSelectedStatus('');
    setSelectedTagIds([]);
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  }, []);

  const hasFilters = selectedType || selectedStatus || selectedTagIds.length > 0 || query.trim();

  const renderItem = useCallback(
    ({ item }: { item: MediaCardItem }) => (
      <MediaCard item={item} variant="list" />
    ),
    [],
  );

  return (
    <ErrorBoundary name="SearchScreen">
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.content, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Search</ThemedText>
        </ThemedView>

        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border || 'transparent',
            },
          ]}
        >
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search movies, shows, anime..."
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
              <ThemedText themeColor="textSecondary">✕</ThemedText>
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {MEDIA_TYPES.map((type) => (
            <Pressable
              key={type.key}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor:
                    selectedType === type.key
                      ? theme.primary || theme.backgroundSelected
                      : theme.backgroundElement,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() =>
                setSelectedType(selectedType === type.key ? '' : type.key)
              }
            >
              <ThemedText
                type="small"
                style={[
                  selectedType === type.key && { color: '#FFFFFF' },
                ]}
              >
                {type.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <ThemedView style={styles.filterRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusChipsContent}
          >
            {STATUSES.map((s) => (
              <Pressable
                key={s.key}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor:
                      selectedStatus === s.key
                        ? theme.primary || theme.backgroundSelected
                        : theme.backgroundElement,
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  setSelectedStatus(selectedStatus === s.key ? '' : s.key)
                }
              >
                <ThemedText
                  type="small"
                  style={[
                    selectedStatus === s.key && { color: '#FFFFFF' },
                  ]}
                >
                  {s.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {allTags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statusChipsContent}
              style={styles.tagsScroll}
            >
              {allTags.map((t) => (
                <Pressable
                  key={t.id}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: selectedTagIds.includes(t.id) ? t.color : theme.backgroundElement,
                      borderColor: t.color,
                      borderWidth: 1.5,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => toggleTag(t.id)}
                >
                  <ThemedText
                    type="small"
                    style={[selectedTagIds.includes(t.id) && { color: '#FFFFFF' }]}
                  >
                    {t.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {hasFilters && (
            <Pressable onPress={clearFilters} style={styles.clearFiltersButton}>
              <ThemedText type="small" themeColor="textSecondary">
                Clear
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

        <ThemedText
          themeColor="textSecondary"
          type="small"
          style={styles.resultsLabel}
        >
          {resultsLabel}
        </ThemedText>

        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: paddingBottom + Spacing.four },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <ThemedView style={styles.emptyState}>
              <ThemedText themeColor="textSecondary">
                {query.trim() || hasFilters
                  ? 'No results found'
                  : 'Start typing to search'}
              </ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingVertical: Spacing.three,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: Spacing.one,
  },
  chipsScroll: {
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
    marginHorizontal: -Spacing.four,
  },
  chipsContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  statusChipsContent: {
    gap: Spacing.two,
  },
  tagsScroll: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  clearFiltersButton: {
    paddingLeft: Spacing.three,
  },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  resultsLabel: {
    marginBottom: Spacing.two,
  },
  listContent: {
    gap: Spacing.two,
  },
  emptyState: {
    paddingVertical: Spacing.seven,
    alignItems: 'center',
  },
});

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { SearchBar } from '@/components/ui/search-bar';
import { FilterSegmentedTabs } from '@/components/ui/filter-segmented-tabs';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';
import { fuzzySearch } from '@/services/fuzzy-search';
import { getDatabase } from '@/db';
import { media, mediaTags } from '@/db/schema';
import { getAllTags } from '@/db/queries';
import { MediaCard, type MediaCardItem } from '@/components/media/media-card';

function ScalePressable({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...props
}: {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
} & Omit<React.ComponentProps<typeof Pressable>, 'onPress' | 'onPressIn' | 'onPressOut' | 'style'>) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[style, animStyle as any]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

const MEDIA_TYPES = [
  { key: '', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv_show', label: 'TV Shows' },
  { key: 'anime', label: 'Anime' },
  { key: 'book', label: 'Books' },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'game', label: 'Games' },
];

const STATUSES = [
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'paused', label: 'Paused' },
  { key: 'dropped', label: 'Dropped' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
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
    if (!debouncedQuery.trim() && !selectedType && !selectedStatus && selectedTagIds.length === 0) {
      return 'Browse your library';
    }
    return `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
  }, [filtered.length, debouncedQuery, selectedType, selectedStatus, selectedTagIds]);

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

  const renderItem = useCallback(
    ({ item }: { item: MediaCardItem }) => (
      <MediaCard item={item} variant="list" />
    ),
    [],
  );

  return (
    <ErrorBoundary name="SearchScreen">
      <ThemedView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing.three },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.inner}>
            <ThemedText style={styles.title}>Discover</ThemedText>

            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search movies, shows, books..."
              style={styles.searchBar}
            />

            <FilterSegmentedTabs
              items={MEDIA_TYPES}
              selected={selectedType}
              onSelect={(key) => setSelectedType(key === selectedType ? '' : key)}
              style={styles.segmentedTabs}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsRow}
              style={styles.pillsScroll}
            >
              {STATUSES.map((s) => {
                const isActive = selectedStatus === s.key;
                return (
                  <ScalePressable
                    key={s.key}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isActive ? theme.primary : theme.backgroundElement,
                      },
                    ]}
                    onPress={() => {
                      haptics.light();
                      setSelectedStatus(isActive ? '' : s.key);
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.pillText,
                        { color: isActive ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {s.label}
                    </ThemedText>
                  </ScalePressable>
                );
              })}
            </ScrollView>

            <ThemedText style={[styles.resultsLabel, { color: theme.textSecondary }]}>
              {resultsLabel}
            </ThemedText>
          </ThemedView>
        </ScrollView>

        <View style={[styles.listContainer, { paddingBottom }]}>
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <ThemedView style={styles.emptyState}>
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {query.trim() || selectedType || selectedStatus || selectedTagIds.length > 0
                    ? 'No results found'
                    : 'Start typing to search'}
                </ThemedText>
              </ThemedView>
            }
          />
        </View>
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexShrink: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
  },
  inner: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  searchBar: {
    marginBottom: Spacing.three,
  },
  segmentedTabs: {
    marginBottom: Spacing.three,
  },
  pillsScroll: {
    marginBottom: Spacing.three,
    marginHorizontal: -Spacing.four,
  },
  pillsRow: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsLabel: {
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  emptyState: {
    paddingVertical: Spacing.seven,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});

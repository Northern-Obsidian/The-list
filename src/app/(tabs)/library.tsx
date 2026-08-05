import { useCallback, useMemo, useState } from 'react';
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
import { router, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { FilterSegmentedTabs } from '@/components/ui/filter-segmented-tabs';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';
import { LIST_OPTIMIZATION_PROPS } from '@/utils/performance';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';

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
  const haptics = useHaptics();
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
    ({ item }: { item: typeof media.$inferSelect }) => (
      <ScalePressable
        style={[
          styles.card,
          { backgroundColor: theme.backgroundElement },
        ]}
        onPress={() => {
          haptics.light();
          router.push(`/media/${item.id}`);
        }}
      >
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.cardSubtype, { color: theme.textSecondary }]}>
          {item.mediaType.replace(/_/g, ' ')}
        </ThemedText>
        {item.personalRating ? (
          <View style={styles.cardRating}>
            <Icon name="star" size={10} color={theme.textSecondary} />
            <ThemedText style={[styles.cardRatingText, { color: theme.textSecondary }]}>
              {item.personalRating}
            </ThemedText>
          </View>
        ) : null}
      </ScalePressable>
    ),
    [theme, haptics],
  );

  const renderEmpty = useCallback(
    () => (
      <ThemedView style={styles.emptyState}>
        <ThemedText style={styles.emptyIcon}>📚</ThemedText>
        <ThemedText style={styles.emptyTitle}>
          Your library is empty
        </ThemedText>
        <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
          Start adding movies, shows, anime, and more to build your collection.
        </ThemedText>
      </ThemedView>
    ),
    [theme],
  );

  return (
    <ErrorBoundary name="LibraryScreen">
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.content, { paddingTop: insets.top }]}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.headerTitle}>Library</ThemedText>
            <View style={[styles.countBadge, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.countText, { color: theme.textSecondary }]}>
                {sortedAndFiltered.length}
              </ThemedText>
            </View>
          </ThemedView>

          <FilterSegmentedTabs
            items={TYPE_FILTERS}
            selected={typeFilter}
            onSelect={setTypeFilter}
            style={styles.filterTabs}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sortScroll}
            contentContainerStyle={styles.sortContent}
          >
            {SORT_OPTIONS.map((opt) => (
              <ScalePressable
                key={opt.key}
                style={[
                  styles.sortPill,
                  { backgroundColor: sortBy === opt.key ? theme.backgroundSelected : theme.backgroundElement },
                ]}
                onPress={() => {
                  haptics.light();
                  setSortBy(opt.key);
                }}
              >
                <ThemedText
                  style={[
                    styles.sortPillText,
                    { color: sortBy === opt.key ? theme.text : theme.textSecondary },
                  ]}
                >
                  {opt.label}
                </ThemedText>
              </ScalePressable>
            ))}
          </ScrollView>

          <FlatList
            data={sortedAndFiltered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: paddingBottom + Spacing.four },
            ]}
            columnWrapperStyle={styles.gridRow}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            {...LIST_OPTIMIZATION_PROPS}
          />
        </ThemedView>
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.two,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabs: {
    marginBottom: Spacing.two,
  },
  sortScroll: {
    flexGrow: 0,
    marginBottom: Spacing.three,
  },
  sortContent: {
    gap: Spacing.two,
  },
  sortPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  gridRow: {
    gap: Spacing.two,
  },
  card: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: Spacing.two,
    aspectRatio: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardSubtype: {
    fontSize: 10,
    textTransform: 'capitalize',
    marginTop: Spacing.half,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: Spacing.one,
  },
  cardRatingText: {
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.three,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
});

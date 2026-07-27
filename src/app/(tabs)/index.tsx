import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { desc } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/glass-card';
import { MediaCard, type MediaCardItem } from '@/components/media/media-card';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { media, watchHistory } from '@/db/schema';
import { pickRandom } from '@/services/random-picker';
import { getInProgress, getFavorites, getCollectionsWithCounts, getMediaCounts } from '@/db/queries';
import { getRecommendations, getTopRated, getUnwatchedRecommendations } from '@/services/recommendation-engine';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  const [totalItems, setTotalItems] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [showsCount, setShowsCount] = useState(0);
  const [animeCount, setAnimeCount] = useState(0);
  const [inProgress, setInProgress] = useState<MediaCardItem[]>([]);
  const [recentItems, setRecentItems] = useState<MediaCardItem[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<MediaCardItem[]>([]);
  const [collectionsList, setCollectionsList] = useState<{ id: string; name: string; icon: string | null; color: string | null; itemCount: number }[]>([]);
  const [recommendations, setRecommendations] = useState<MediaCardItem[]>([]);
  const [topRated, setTopRated] = useState<MediaCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { db } = getDatabase();
    const counts = getMediaCounts();
    setTotalItems(counts.total);
    setMoviesCount(counts.byType['movie'] || 0);
    const showTypes = ['tv_show', 'mini_series', 'web_series'];
    setShowsCount(showTypes.reduce((sum, t) => sum + (counts.byType[t] || 0), 0));
    setAnimeCount(counts.byType['anime'] || 0);

    setInProgress(getInProgress().map(toMediaCardItem));
    setFavoriteItems(getFavorites().map(toMediaCardItem));

    const recentHistory = db
      .select()
      .from(watchHistory)
      .orderBy(desc(watchHistory.watchedAt))
      .limit(10)
      .all();
    if (recentHistory.length > 0) {
      const recentMediaIds = [...new Set(recentHistory.map((h) => h.mediaId))];
      const allMedia = db.select().from(media).all();
      const recentMedia = allMedia
        .filter((m) => recentMediaIds.includes(m.id))
        .map(toMediaCardItem);
      setRecentItems(recentMedia.slice(0, 5));
    }

    setCollectionsList(getCollectionsWithCounts());
  }, []);

  return (
    <ErrorBoundary name="HomeScreen">
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: paddingBottom }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Your Library</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {totalItems} items tracked
          </ThemedText>
        </ThemedView>

        {loading ? (
          <>
          <ThemedView style={styles.loadingSection}>
            <Skeleton height={80} borderRadius={12} />
            <Skeleton height={60} borderRadius={12} width="48%" />
            <Skeleton height={60} borderRadius={12} width="48%" />
            <Skeleton height={100} borderRadius={12} />
            <Skeleton height={100} borderRadius={12} />
          </ThemedView>
          </>
        ) : (
          <>
        <GlassCard>
          <ThemedText type="display" style={styles.summaryNumber}>{totalItems}</ThemedText>
          <ThemedText themeColor="textSecondary">Total Items</ThemedText>
        </GlassCard>

        <ThemedView style={styles.quickStats}>
          <GlassCard style={styles.statCard}>
            <ThemedText type="h2" style={styles.statNumber}>{moviesCount}</ThemedText>
            <ThemedText themeColor="textSecondary" type="caption">Movies</ThemedText>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <ThemedText type="h2" style={styles.statNumber}>{showsCount}</ThemedText>
            <ThemedText themeColor="textSecondary" type="caption">Shows</ThemedText>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <ThemedText type="h2" style={styles.statNumber}>{animeCount}</ThemedText>
            <ThemedText themeColor="textSecondary" type="caption">Anime</ThemedText>
          </GlassCard>
        </ThemedView>

        {collectionsList.length > 0 && (
          <ThemedView style={styles.sectionCard}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Collections
              </ThemedText>
              <Pressable onPress={() => router.push('/collections')}>
                <ThemedText type="link" style={styles.seeAll}>See all</ThemedText>
              </Pressable>
            </ThemedView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionsScroll}>
              {collectionsList.map((c) => (
                <Pressable
                  key={c.id}
                  style={({ pressed }) => [
                    styles.collectionCard,
                    { backgroundColor: theme.backgroundElement },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => router.push(`/collections/${c.id}`)}
                >
                  <ThemedText style={styles.collectionCardIcon}>{c.icon || '📁'}</ThemedText>
                  <ThemedText type="small" numberOfLines={1} style={styles.collectionCardName}>
                    {c.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {c.itemCount} items
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </ThemedView>
        )}

        {favoriteItems.length > 0 && (
          <GlassCard>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Favorites
              </ThemedText>
            </ThemedView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesScroll}>
              {favoriteItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.favoriteCard,
                    { backgroundColor: theme.background },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => router.push(`/media/${item.id}`)}
                >
                  <ThemedText style={styles.favoriteCardIcon}>
                    {item.mediaType === 'movie' ? '🎬' : item.mediaType === 'tv_show' ? '📺' : '📖'}
                  </ThemedText>
                  <ThemedText type="small" numberOfLines={1} style={styles.favoriteCardName}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </GlassCard>
        )}

        <GlassCard style={styles.randomPickerCard}>
          <Pressable
            style={({ pressed }) => [styles.randomPickerContent, pressed && { opacity: 0.7 }]}
            onPress={() => {
              const pick = pickRandom();
              if (pick) {
                router.push(`/media/${pick.id}`);
              } else {
                Alert.alert('Nothing to Pick', 'Add some items to your library first.');
              }
            }}
          >
            <ThemedText style={styles.randomPickerIcon}>🎲</ThemedText>
            <ThemedView style={styles.randomPickerInfo}>
              <ThemedText type="smallBold" style={styles.randomPickerTitle}>
                Pick for Me
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Surprise me with a random item
              </ThemedText>
            </ThemedView>
            <ThemedText type="link">→</ThemedText>
          </Pressable>
        </GlassCard>

        {recommendations.length > 0 && (
          <GlassCard>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Recommended for You
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritesScroll}>
              {recommendations.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.favoriteCard,
                    { backgroundColor: theme.background },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => router.push(`/media/${item.id}`)}
                >
                  <ThemedText style={styles.favoriteCardIcon}>
                    {item.mediaType === 'movie' ? '🎬' : item.mediaType === 'tv_show' ? '📺' : '📖'}
                  </ThemedText>
                  <ThemedText type="small" numberOfLines={1} style={styles.favoriteCardName}>
                    {item.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </GlassCard>
        )}

        {topRated.length > 0 && (
          <GlassCard>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Top Rated
            </ThemedText>
            <View style={styles.itemList}>
              {topRated.slice(0, 5).map((item) => (
                <MediaCard key={item.id} item={item} variant="list" />
              ))}
            </View>
          </GlassCard>
        )}

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Continue Watching
          </ThemedText>
          {inProgress.length > 0 ? (
            <View style={styles.itemList}>
              {inProgress.slice(0, 5).map((item) => (
                <MediaCard key={item.id} item={item} variant="list" />
              ))}
            </View>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText themeColor="textSecondary">No items in progress</ThemedText>
            </ThemedView>
          )}
        </GlassCard>

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          {recentItems.length > 0 ? (
            <View style={styles.itemList}>
              {recentItems.map((item) => (
                <MediaCard key={item.id} item={item} variant="list" />
              ))}
            </View>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText themeColor="textSecondary">No recent activity</ThemedText>
            </ThemedView>
          )}
        </GlassCard>

        )}

        <ThemedView style={styles.quickLinks}>
          <Pressable
            style={({ pressed }) => [styles.quickLink, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/media/new')}
          >
            <ThemedText type="smallBold">➕ Add Media</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickLink, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/calendar')}
          >
            <ThemedText type="smallBold">📅 Calendar</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickLink, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/achievements')}
          >
            <ThemedText type="smallBold">🏆 Achievements</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

function toMediaCardItem(m: typeof media.$inferSelect): MediaCardItem {
  return {
    id: m.id,
    title: m.title,
    mediaType: m.mediaType,
    status: m.status,
    year: m.year,
    personalRating: m.personalRating,
    genres: m.genres,
    posterPath: m.posterPath,
  };
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  loadingSection: { gap: Spacing.four, paddingVertical: Spacing.four },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { gap: Spacing.half, paddingVertical: Spacing.three },
  summaryCard: { borderRadius: Spacing.four, padding: Spacing.five, alignItems: 'center', gap: Spacing.one },
  summaryNumber: { fontSize: 56 },
  quickStats: { flexDirection: 'row', gap: Spacing.three },
  statCard: { flex: 1, borderRadius: Spacing.three, padding: Spacing.four, alignItems: 'center', gap: Spacing.half },
  statNumber: { fontSize: 28 },
  sectionCard: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  seeAll: {},
  collectionsScroll: { marginHorizontal: -Spacing.four, paddingHorizontal: Spacing.four },
  collectionCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one, alignItems: 'center', minWidth: 100, marginRight: Spacing.two },
  collectionCardIcon: { fontSize: 28 },
  collectionCardName: { maxWidth: 80 },
  favoritesScroll: { marginHorizontal: -Spacing.four, paddingHorizontal: Spacing.four },
  favoriteCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one, alignItems: 'center', minWidth: 90, marginRight: Spacing.two },
  favoriteCardIcon: { fontSize: 24 },
  favoriteCardName: { maxWidth: 80, textAlign: 'center' },
  randomPickerCard: { borderRadius: Spacing.four, overflow: 'hidden' },
  randomPickerContent: { flexDirection: 'row', alignItems: 'center', padding: Spacing.four, gap: Spacing.three },
  randomPickerIcon: { fontSize: 32 },
  randomPickerInfo: { flex: 1, gap: Spacing.half },
  randomPickerTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  emptyState: { paddingVertical: Spacing.five, alignItems: 'center' },
  itemList: { gap: Spacing.two },
  quickLinks: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' },
  quickLink: { flex: 1, minWidth: '30%', paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.three, alignItems: 'center' },
});

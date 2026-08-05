import { useEffect, useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { desc } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GreetingHeader } from '@/components/greeting-header';
import { StatCard } from '@/components/ui/stat-card';
import { ContinueWatchingCard } from '@/components/continue-watching-card';
import { RecommendationRow } from '@/components/recommendation-row';
import { TrendingRow } from '@/components/trending-row';
import { Icon, iconForMediaType } from '@/components/ui/icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { media, watchHistory } from '@/db/schema';
import { pickRandom } from '@/services/random-picker';
import { getInProgress, getFavorites, getCollectionsWithCounts, getMediaCounts } from '@/db/queries';
import { useHaptics } from '@/hooks/use-haptics';

import { Skeleton } from '@/components/ui/skeleton';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  const [totalItems, setTotalItems] = useState(0);
  const [moviesCount, setMoviesCount] = useState(0);
  const [showsCount, setShowsCount] = useState(0);
  const [animeCount, setAnimeCount] = useState(0);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const { db } = getDatabase();
      const counts = getMediaCounts();
      setTotalItems(counts.total);
      setMoviesCount(counts.byType['movie'] || 0);
      const showTypes = ['tv_show', 'mini_series', 'web_series'];
      setShowsCount(showTypes.reduce((sum, t) => sum + (counts.byType[t] || 0), 0));
      setAnimeCount(counts.byType['anime'] || 0);

      setInProgress(getInProgress().slice(0, 5));
      setFavoriteItems(getFavorites().slice(0, 10));

      const recentHistory = db
        .select()
        .from(watchHistory)
        .orderBy(desc(watchHistory.watchedAt))
        .limit(10)
        .all();
      if (recentHistory.length > 0) {
        const recentMediaIds = [...new Set(recentHistory.map((h) => h.mediaId))];
        const allMedia = db.select().from(media).all();
        const recentMedia = allMedia.filter((m) => recentMediaIds.includes(m.id));
        setRecentItems(recentMedia.slice(0, 10));
      }

      setLoading(false);
    }, [])
  );

  const quickLinks = [
    { label: 'Add', icon: 'plus' as const, route: '/media/new' },
    { label: 'Calendar', icon: 'calendar' as const, route: '/calendar' },
    { label: 'Achieve', icon: 'trophy' as const, route: '/achievements' as any },
  ];

  return (
    <ErrorBoundary name="HomeScreen">
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: paddingBottom }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <GreetingHeader />

        {loading ? (
          <ThemedView style={styles.loadingSection}>
            <Skeleton height={60} borderRadius={12} />
            <Skeleton height={200} borderRadius={16} />
            <Skeleton height={200} borderRadius={16} />
            <Skeleton height={180} borderRadius={12} />
          </ThemedView>
        ) : (
          <>
            <ThemedView style={styles.statsRow}>
              <StatCard value={moviesCount} label="Movies" icon="movie" />
              <StatCard value={showsCount} label="Shows" icon="tv" />
              <StatCard value={animeCount} label="Anime" icon="disc" />
            </ThemedView>

            <ThemedView style={styles.section}>
              <ContinueWatchingCard
                id={inProgress[0]?.id || ''}
                title={inProgress[0]?.title || ''}
                subtitle={inProgress[0]?.mediaType || ''}
                progress={inProgress[0]?.personalRating ? inProgress[0].personalRating / 10 : 0.6}
                timeRemaining="2h 34m left"
              />
            </ThemedView>

            <ThemedView style={styles.section}>
              <RecommendationRow
                title="Because you watched..."
                items={favoriteItems.map((item) => ({
                  id: item.id,
                  title: item.title,
                  mediaType: item.mediaType,
                  year: item.year,
                  posterPath: item.posterPath,
                }))}
              />
            </ThemedView>

            <ThemedView style={styles.section}>
              <TrendingRow
                title="Recently Added"
                items={recentItems.map((item) => ({
                  id: item.id,
                  title: item.title,
                  mediaType: item.mediaType,
                  year: item.year,
                  posterPath: item.posterPath,
                }))}
              />
            </ThemedView>

            <ThemedView style={styles.quickLinks}>
              {quickLinks.map((link) => (
                <Pressable
                  key={link.label}
                  style={({ pressed }) => [
                    styles.quickLink,
                    { backgroundColor: theme.backgroundElement },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    haptics.light();
                    router.push(link.route);
                  }}
                >
                  <Icon name={link.icon} size={18} color={theme.text} />
                  <ThemedText type="smallBold">{link.label}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </>
        )}
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.five, paddingBottom: Spacing.four },
  loadingSection: { gap: Spacing.four, paddingVertical: Spacing.four },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  section: { gap: Spacing.two },
  quickLinks: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' },
  quickLink: { flex: 1, minWidth: '30%', paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.three, alignItems: 'center' },
});

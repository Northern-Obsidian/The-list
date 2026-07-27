import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { media, ratings, series } from '@/db/schema';
import { getMediaById, getSeriesById } from '@/db/queries';
import { WatchProviderLinks } from '@/components/watch-provider-links';
import { getWatchLinks, saveWatchLinks, type WatchLink } from '@/services/watch-provider-service';
import { generateId } from '@/utils/generate-id';
import { SERIES_TYPES } from '@/types/media';

const TYPE_ICONS: Record<string, string> = {
  movie: '🎬', tv_show: '📺', anime: '📖', documentary: '🎥',
  web_series: '📹', mini_series: '🎞️', ova: '💿', cartoon: '🖍️',
  reality_show: '📺', podcast: '🎙️', audiobook: '🎧', book: '📚', game: '🎮', drama: '🎭',
};

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [item, setItem] = useState<(typeof media.$inferSelect) | null>(null);
  const [seriesData, setSeriesData] = useState<typeof series.$inferSelect | null>(null);
  const [ratingData, setRatingData] = useState<typeof ratings.$inferSelect | null>(null);
  const [watchLinks, setWatchLinks] = useState<WatchLink[]>([]);

  useEffect(() => {
    if (!id) return;
    const { db } = getDatabase();
    const result = getMediaById(id);
    if (result) {
      setItem(result);
      setWatchLinks(getWatchLinks(result));
      setSeriesData(getSeriesById(id) ?? null);
      const r = db.select().from(ratings).where(eq(ratings.mediaId, id)).get();
      setRatingData(r ?? null);
    }
  }, [id]);

  const handleAddWatchLink = useCallback(
    async (link: WatchLink) => {
      if (!id) return;
      const updated = [...watchLinks, link];
      setWatchLinks(updated);
      await saveWatchLinks(id, updated);
    },
    [id, watchLinks],
  );

  const handleRemoveWatchLink = useCallback(
    async (index: number) => {
      if (!id) return;
      const updated = watchLinks.filter((_, i) => i !== index);
      setWatchLinks(updated);
      await saveWatchLinks(id, updated);
    },
    [id, watchLinks],
  );

  const handleDelete = useCallback(() => {
    if (!id || !item) return;
    Alert.alert('Delete Media', `Are you sure you want to delete "${item.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const { db } = getDatabase();
          db.delete(media).where(eq(media.id, id)).run();
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        },
      },
    ]);
  }, [id, item]);

  const handleRatingToggle = useCallback(
    (field: 'heart' | 'thumbsUp' | 'masterpiece' | 'needRewatch') => {
      if (!id || !item) return;
      const { db } = getDatabase();
      const existing = db.select().from(ratings).where(eq(ratings.mediaId, id)).get();
      const now = new Date().toISOString();
      if (existing) {
        db.update(ratings)
          .set({ [field]: !existing[field], updatedAt: now })
          .where(eq(ratings.id, existing.id))
          .run();
      } else {
        db.insert(ratings)
          .values({
            id: generateId(),
            mediaId: id,
            profileId: getActiveProfileId(),
            score: item.personalRating || 0,
            [field]: true,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      }
      const r = db.select().from(ratings).where(eq(ratings.mediaId, id)).get();
      setRatingData(r ?? null);
    },
    [id, item],
  );

  if (!item) {
    return <ScreenLoader />;
  }

  const isSeriesType = SERIES_TYPES.includes(item.mediaType as typeof SERIES_TYPES[number]);
  const seriesProgress = seriesData && (seriesData.totalEpisodes ?? 0) > 0
    ? (seriesData.completedEpisodes || 0) / (seriesData.totalEpisodes ?? 1)
    : 0;

  return (
    <ErrorBoundary name="MediaDetailScreen">
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.push(`/media/${id}/edit`)}>
            <ThemedText type="link">Edit</ThemedText>
          </Pressable>
        </View>

        <ThemedView style={styles.hero}>
          <ThemedText style={styles.posterPlaceholder}>{TYPE_ICONS[item.mediaType] || '🎬'}</ThemedText>
          <Badge label={item.mediaType.replace(/_/g, ' ')} variant="filled" style={styles.typeBadge} />
        </ThemedView>

        <ThemedText type="subtitle">{item.title}</ThemedText>

        {item.overview && <ThemedText themeColor="textSecondary">{item.overview}</ThemedText>}

        {isSeriesType && seriesData && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Progress</ThemedText>
            <ProgressBar progress={seriesProgress} color={theme.primary} />
            <ThemedText type="small" themeColor="textSecondary">
              {seriesData.completedEpisodes || 0} of {seriesData.totalEpisodes || 0} episodes
            </ThemedText>
          </ThemedView>
        )}

        {isSeriesType && (
          <Pressable
            style={({ pressed }) => [styles.seriesLink, { backgroundColor: theme.primary }, pressed && { opacity: 0.7 }]}
            onPress={() => router.push(`/series/${id}`)}
          >
            <ThemedText style={{ color: '#FFF', fontWeight: '600' }}>📺 View Series Progress</ThemedText>
          </Pressable>
        )}

        <ThemedView style={styles.ratingRow}>
          <Pressable
            style={({ pressed }) => [styles.ratingBtn, { backgroundColor: theme.backgroundElement }, ratingData?.heart && { backgroundColor: theme.error }, pressed && { opacity: 0.7 }]}
            onPress={() => handleRatingToggle('heart')}
          >
            <ThemedText style={ratingData?.heart ? { color: '#FFF' } : undefined}>❤️</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ratingBtn, { backgroundColor: theme.backgroundElement }, ratingData?.thumbsUp && { backgroundColor: theme.primary }, pressed && { opacity: 0.7 }]}
            onPress={() => handleRatingToggle('thumbsUp')}
          >
            <ThemedText style={ratingData?.thumbsUp ? { color: '#FFF' } : undefined}>👍</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ratingBtn, { backgroundColor: theme.backgroundElement }, ratingData?.masterpiece && { backgroundColor: theme.warning }, pressed && { opacity: 0.7 }]}
            onPress={() => handleRatingToggle('masterpiece')}
          >
            <ThemedText style={ratingData?.masterpiece ? { color: '#FFF' } : undefined}>🏆</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ratingBtn, { backgroundColor: theme.backgroundElement }, ratingData?.needRewatch && { backgroundColor: theme.success }, pressed && { opacity: 0.7 }]}
            onPress={() => handleRatingToggle('needRewatch')}
          >
            <ThemedText style={ratingData?.needRewatch ? { color: '#FFF' } : undefined}>🔄</ThemedText>
          </Pressable>
        </ThemedView>

        {item.genres && (
          <View style={styles.genresRow}>
            {(JSON.parse(item.genres) as string[]).map((g) => (
              <Badge key={g} label={g} variant="outlined" />
            ))}
          </View>
        )}

        <View style={styles.metaRow}>
          {item.year && <ThemedText type="small" themeColor="textSecondary">{item.year}</ThemedText>}
          {item.runtime && <ThemedText type="small" themeColor="textSecondary">{item.runtime} min</ThemedText>}
          {item.personalRating && <ThemedText type="small" themeColor="textSecondary">⭐ {item.personalRating}/10</ThemedText>}
          {seriesData?.airStatus && (
            <Badge
              label={seriesData.airStatus === 'airing' ? 'Airing' : seriesData.airStatus === 'completed' ? 'Completed' : 'Upcoming'}
              variant="filled"
              color={seriesData.airStatus === 'airing' ? '#34D399' : seriesData.airStatus === 'completed' ? '#3C9FFE' : '#FBBF24'}
            />
          )}
        </View>

        {item.director && <ThemedText type="small" themeColor="textSecondary">Director: {item.director}</ThemedText>}
        {item.actors && <ThemedText type="small" themeColor="textSecondary">Actors: {item.actors}</ThemedText>}

        <WatchProviderLinks links={watchLinks} onAdd={handleAddWatchLink} onRemove={handleRemoveWatchLink} />

        {item.notes && (
          <ThemedView type="backgroundElement" style={styles.notesSection}>
            <ThemedText type="smallBold">Notes</ThemedText>
            <ThemedText>{item.notes}</ThemedText>
          </ThemedView>
        )}

        <View style={styles.actionRow}>
          <Pressable style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]} onPress={() => router.push(`/media/${id}/review`)}>
            <ThemedText type="small">✍️ Review</ThemedText>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]} onPress={() => router.push(`/media/${id}/edit`)}>
            <ThemedText type="small">✏️ Edit</ThemedText>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.actionBtn, { backgroundColor: theme.error }, pressed && { opacity: 0.7 }]} onPress={handleDelete}>
            <ThemedText style={{ color: '#FFF' }}>🗑️ Delete</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.three },
  hero: { height: 300, borderRadius: Spacing.four, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  posterPlaceholder: { fontSize: 80 },
  typeBadge: { position: 'absolute', top: Spacing.three, right: Spacing.three },
  section: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  seriesLink: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.three, alignItems: 'center' },
  ratingRow: { flexDirection: 'row', gap: Spacing.three },
  ratingBtn: { width: 52, height: 52, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center' },
  genresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  metaRow: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap', alignItems: 'center' },
  notesSection: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  actionRow: { flexDirection: 'row', gap: Spacing.three },
  actionBtn: { flex: 1, paddingVertical: Spacing.three, borderRadius: Spacing.three, alignItems: 'center' },
});

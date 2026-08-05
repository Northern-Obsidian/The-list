import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Icon, iconForMediaType } from '@/components/ui/icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { getDatabase, getActiveProfileId } from '@/db';
import { media, ratings, series } from '@/db/schema';
import { getMediaById, getSeriesById } from '@/db/queries';
import { WatchProviderLinks } from '@/components/watch-provider-links';
import { getWatchLinks, saveWatchLinks, type WatchLink } from '@/services/watch-provider-service';
import { generateId } from '@/utils/generate-id';
import { SERIES_TYPES } from '@/types/media';

function ScalePressable({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[style, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function MediaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
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
          <View style={styles.hero}>
            <View style={[styles.heroBackdrop, { backgroundColor: theme.backgroundTertiary }]}>
              <Icon name={iconForMediaType(item.mediaType)} size={80} color={theme.textSecondary} />
            </View>

            <View style={[styles.heroTopLeft, { top: insets.top + 8 }]}>
              <Pressable style={[styles.circleBtn, { backgroundColor: theme.overlay }]} onPress={() => { haptics.light(); router.back(); }}>
                <Icon name="arrow-left" size={20} color="#FFF" />
              </Pressable>
            </View>
            <View style={[styles.heroTopRight, { top: insets.top + 8 }]}>
              <Pressable style={[styles.circleBtn, { backgroundColor: theme.overlay }]} onPress={() => { haptics.light(); router.push(`/media/${id}/edit`); }}>
                <Icon name="pencil" size={20} color="#FFF" />
              </Pressable>
            </View>

            <Badge
              label={item.mediaType.replace(/_/g, ' ')}
              variant="filled"
              style={[styles.typeBadge, { backgroundColor: theme.primary }]}
            />

            <View style={styles.heroTitleOverlay}>
              <ThemedText style={styles.heroTitle}>{item.title}</ThemedText>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.metaRow}>
              {item.year && <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>{item.year}</ThemedText>}
              {item.year && <ThemedText style={{ color: theme.textSecondary }}>·</ThemedText>}
              {item.runtime && <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>{item.runtime} min</ThemedText>}
              {item.runtime && <ThemedText style={{ color: theme.textSecondary }}>·</ThemedText>}
              {item.personalRating && <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>{item.personalRating}/10</ThemedText>}
              {seriesData?.airStatus && (
                <Badge
                  label={seriesData.airStatus === 'airing' ? 'Airing' : seriesData.airStatus === 'completed' ? 'Completed' : 'Upcoming'}
                  variant="filled"
                  color={seriesData.airStatus === 'airing' ? theme.success : seriesData.airStatus === 'completed' ? theme.info : theme.warning}
                />
              )}
            </View>

            {item.genres && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genresScroll} contentContainerStyle={styles.genresRow}>
                {(JSON.parse(item.genres) as string[]).map((g) => (
                  <View key={g} style={[styles.genreChip, { backgroundColor: theme.backgroundElement }]}>
                    <ThemedText style={[styles.genreChipText, { color: theme.text }]}>{g}</ThemedText>
                  </View>
                ))}
              </ScrollView>
            )}

            {item.overview && (
              <ThemedText style={[styles.overviewText, { color: theme.textSecondary }]}>{item.overview}</ThemedText>
            )}

            {item.director && <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>Director: {item.director}</ThemedText>}
            {item.actors && <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>Actors: {item.actors}</ThemedText>}
          </View>

          <View style={styles.ratingRow}>
            <ScalePressable
              style={[styles.ratingBtn, { backgroundColor: ratingData?.heart ? theme.error : theme.backgroundElement }]}
              onPress={() => { haptics.light(); handleRatingToggle('heart'); }}
            >
              <Icon name="heart" size={24} color={ratingData?.heart ? '#FFF' : theme.textSecondary} />
            </ScalePressable>
            <ScalePressable
              style={[styles.ratingBtn, { backgroundColor: ratingData?.thumbsUp ? theme.primary : theme.backgroundElement }]}
              onPress={() => { haptics.light(); handleRatingToggle('thumbsUp'); }}
            >
              <Icon name="thumb-up" size={24} color={ratingData?.thumbsUp ? '#FFF' : theme.textSecondary} />
            </ScalePressable>
            <ScalePressable
              style={[styles.ratingBtn, { backgroundColor: ratingData?.masterpiece ? theme.warning : theme.backgroundElement }]}
              onPress={() => { haptics.light(); handleRatingToggle('masterpiece'); }}
            >
              <Icon name="trophy" size={24} color={ratingData?.masterpiece ? '#FFF' : theme.textSecondary} />
            </ScalePressable>
            <ScalePressable
              style={[styles.ratingBtn, { backgroundColor: ratingData?.needRewatch ? theme.success : theme.backgroundElement }]}
              onPress={() => { haptics.light(); handleRatingToggle('needRewatch'); }}
            >
              <Icon name="refresh" size={24} color={ratingData?.needRewatch ? '#FFF' : theme.textSecondary} />
            </ScalePressable>
          </View>

          {isSeriesType && seriesData && (
            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>Progress</ThemedText>
              <ProgressBar progress={seriesProgress} color={theme.primary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {seriesData.completedEpisodes || 0} of {seriesData.totalEpisodes || 0} episodes
              </ThemedText>
              <Pressable
                style={({ pressed }) => [styles.seriesLinkBtn, { backgroundColor: theme.primary }, pressed && { opacity: 0.7 }]}
                onPress={() => router.push(`/series/${id}`)}
              >
                <ThemedText style={styles.seriesLinkText}>View Series Progress</ThemedText>
              </Pressable>
            </ThemedView>
          )}

          <WatchProviderLinks links={watchLinks} onAdd={handleAddWatchLink} onRemove={handleRemoveWatchLink} />

          {item.notes && (
            <ThemedView type="backgroundElement" style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
              <ThemedText>{item.notes}</ThemedText>
            </ThemedView>
          )}

          <View style={styles.actionRow}>
            <ScalePressable
              style={[styles.bottomActionBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={() => { haptics.light(); router.push(`/media/${id}/review`); }}
            >
              <Icon name="edit" size={14} color={theme.text} />
              <ThemedText style={styles.bottomActionText}>Review</ThemedText>
            </ScalePressable>
            <ScalePressable
              style={[styles.bottomActionBtn, { backgroundColor: theme.backgroundElement }]}
              onPress={() => { haptics.light(); router.push(`/media/${id}/edit`); }}
            >
              <Icon name="pencil" size={14} color={theme.text} />
              <ThemedText style={styles.bottomActionText}>Edit</ThemedText>
            </ScalePressable>
            <ScalePressable
              style={[styles.bottomActionBtn, { backgroundColor: theme.error }]}
              onPress={() => { haptics.light(); handleDelete(); }}
            >
              <Icon name="trash" size={14} color="#FFF" />
              <ThemedText style={[styles.bottomActionText, { color: '#FFF' }]}>Delete</ThemedText>
            </ScalePressable>
          </View>
        </ThemedView>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, paddingBottom: Spacing.four },
  hero: { position: 'relative', height: 300 },
  heroBackdrop: { height: 300, justifyContent: 'center', alignItems: 'center' },
  heroTopLeft: { position: 'absolute', left: 16 },
  heroTopRight: { position: 'absolute', right: 16 },
  circleBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  typeBadge: { position: 'absolute', top: 16, right: 16, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  heroTitleOverlay: { position: 'absolute', bottom: 16, left: 16 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  infoSection: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, gap: Spacing.three },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  metaText: { fontSize: 13 },
  genresScroll: { marginHorizontal: -Spacing.four },
  genresRow: { paddingHorizontal: Spacing.four, gap: Spacing.two },
  genreChip: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  genreChipText: { fontSize: 12 },
  overviewText: { fontSize: 14, lineHeight: 20 },
  ratingRow: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingTop: Spacing.four },
  ratingBtn: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  section: { padding: Spacing.four, borderRadius: 16, gap: Spacing.two },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  seriesLinkBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  seriesLinkText: { color: '#FFF', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.four, paddingTop: Spacing.four },
  bottomActionBtn: { flex: 1, flexDirection: 'row', gap: 4, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bottomActionText: { fontSize: 13 },
});

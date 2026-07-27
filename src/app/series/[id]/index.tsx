import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { media } from '@/db/schema';
import { getMediaById } from '@/db/queries';
import {
  getSeriesProgress,
  getSeasonsWithProgress,
  getEpisodes,
  getNextUnwatchedEpisode,
  type SeriesProgress,
  type SeasonProgress,
} from '@/services/progress-engine';
export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [item, setItem] = useState<(typeof media.$inferSelect) | null>(null);
  const [progress, setProgress] = useState<SeriesProgress | null>(null);
  const [seasonsData, setSeasonsData] = useState<SeasonProgress[]>([]);

  useEffect(() => {
    if (!id) return;
    const result = getMediaById(id);
    if (result) {
      setItem(result);
      setProgress(getSeriesProgress(id));
      setSeasonsData(getSeasonsWithProgress(id));
    }
  }, [id]);

  const nextEpisode = useMemo(() => {
    if (!id) return null;
    return getNextUnwatchedEpisode(id);
  }, [id]);

  const handleContinue = useCallback(() => {
    if (!nextEpisode || !id) return;
    router.push(`/series/${id}/episode/${nextEpisode.episodeId}`);
  }, [nextEpisode, id]);

  if (!item) {
    return <ScreenLoader />;
  }

  return (
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
          <ThemedText style={styles.posterPlaceholder}>📺</ThemedText>
        </ThemedView>

        <ThemedText type="subtitle">{item.title}</ThemedText>

        {item.overview && (
          <ThemedText themeColor="textSecondary">{item.overview}</ThemedText>
        )}

        {progress && (
          <Card variant="outlined">
            <ThemedText type="smallBold" style={styles.sectionTitle}>Series Progress</ThemedText>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress.percentage * 100)}%` as DimensionValue, backgroundColor: theme.primary }]} />
            </View>
            <ThemedText>
              {progress.completedEpisodes} of {progress.totalEpisodes} episodes ({Math.round(progress.percentage * 100)}%)
            </ThemedText>
            <View style={styles.progressMeta}>
              <ThemedText type="small" themeColor="textSecondary">{progress.totalSeasons} seasons</ThemedText>
              {progress.airStatus && (
                <ThemedText type="small" themeColor="textSecondary">
                  {progress.airStatus === 'airing' ? '📡 Airing' : progress.airStatus === 'completed' ? '✅ Completed' : '🔜 Upcoming'}
                </ThemedText>
              )}
            </View>
            {nextEpisode && (
              <Pressable style={[styles.continueButton, { backgroundColor: theme.primary }]} onPress={handleContinue}>
                <ThemedText style={{ color: '#FFF' }}>Continue S{nextEpisode.episodeNumber}</ThemedText>
              </Pressable>
            )}
          </Card>
        )}

        <ThemedText type="smallBold" style={styles.sectionTitle}>Seasons</ThemedText>

        {seasonsData.map((season) => (
          <Collapsible key={season.seasonId} title={`Season ${season.seasonNumber}${season.title ? ` - ${season.title}` : ''} (${season.completedEpisodes}/${season.episodeCount})`}>
            <SeasonContent
              seasonId={season.seasonId}
              seasonNumber={season.seasonNumber}
              seriesId={id!}
            />
          </Collapsible>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

function SeasonContent({ seasonId, seasonNumber, seriesId }: { seasonId: string; seasonNumber: number; seriesId: string }) {
  const theme = useTheme();
  const [episodes, setEpisodes] = useState<{ id: string; episodeNumber: number; title: string | null; watched: boolean }[]>([]);

  useEffect(() => {
    setEpisodes(getEpisodes(seasonId));
  }, [seasonId]);

  return (
    <View style={styles.episodeList}>
      <Pressable
        style={({ pressed }) => [styles.seasonAction, { backgroundColor: theme.background }, pressed && { opacity: 0.7 }]}
        onPress={() => router.push(`/series/${seriesId}/season/${seasonNumber}`)}
      >
        <ThemedText type="small">View All Episodes →</ThemedText>
      </Pressable>
      {episodes.slice(0, 5).map((ep) => (
        <Pressable
          key={ep.id}
          style={({ pressed }) => [styles.episodeRow, pressed && { opacity: 0.7 }]}
          onPress={() => router.push(`/series/${seriesId}/episode/${ep.id}`)}
        >
          <ThemedText style={styles.episodeNumber}>{ep.episodeNumber}.</ThemedText>
          <ThemedText style={styles.episodeTitle} numberOfLines={1}>
            {ep.title || `Episode ${ep.episodeNumber}`}
          </ThemedText>
          <ThemedText>{ep.watched ? '✅' : '⬜'}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.three },
  hero: { height: 300, borderRadius: Spacing.four, backgroundColor: 'rgba(128,128,128,0.1)', justifyContent: 'center', alignItems: 'center' },
  posterPlaceholder: { fontSize: 80 },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.one },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(128,128,128,0.2)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressMeta: { flexDirection: 'row', gap: Spacing.three },
  continueButton: { paddingVertical: Spacing.three, borderRadius: Spacing.three, alignItems: 'center', marginTop: Spacing.two },
  episodeList: { gap: Spacing.two },
  seasonAction: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.four, borderRadius: Spacing.three },
  episodeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
  episodeNumber: { width: 28, fontWeight: '600' },
  episodeTitle: { flex: 1 },
});

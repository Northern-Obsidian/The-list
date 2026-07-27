import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { media } from '@/db/schema';
import { getMediaById, getSeasonsForSeries } from '@/db/queries';
import {
  getEpisodes,
  markEpisodeWatched,
  markEpisodeUnwatched,
  markAllEpisodesInSeason,
  type EpisodeItem,
} from '@/services/progress-engine';

export default function SeasonDetailScreen() {
  const { id, seasonNumber } = useLocalSearchParams<{ id: string; seasonNumber: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [item, setItem] = useState<(typeof media.$inferSelect) | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const result = getMediaById(id);
    if (result) setItem(result);

    const seasons = getSeasonsForSeries(id);
    const season = seasons.find((s) => s.seasonNumber === parseInt(seasonNumber || '1'));
    if (season) {
      setSeasonId(season.id);
      setEpisodes(getEpisodes(season.id));
    }
  }, [id, seasonNumber]);

  const watchedCount = useMemo(() => episodes.filter((e) => e.watched).length, [episodes]);
  const totalCount = episodes.length;

  const handleToggle = useCallback(
    (episode: EpisodeItem) => {
      if (episode.watched) {
        markEpisodeUnwatched(episode.id);
      } else {
        markEpisodeWatched(episode.id);
      }
      if (seasonId) setEpisodes(getEpisodes(seasonId));
    },
    [seasonId],
  );

  const handleMarkAll = useCallback(
    (watched: boolean) => {
      if (!seasonId) return;
      markAllEpisodesInSeason(seasonId, watched);
      setEpisodes(getEpisodes(seasonId));
    },
    [seasonId],
  );

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
          <ThemedText type="subtitle">Season {seasonNumber}</ThemedText>
          <View style={{ width: 50 }} />
        </View>

        <ThemedText>{item.title}</ThemedText>

        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundElement }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: totalCount > 0 ? `${(watchedCount / totalCount) * 100}%` : '0%',
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {watchedCount}/{totalCount}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Button variant="secondary" onPress={() => handleMarkAll(true)} style={styles.actionButton}>
            Mark All Watched
          </Button>
          <Button variant="secondary" onPress={() => handleMarkAll(false)} style={styles.actionButton}>
            Mark All Unwatched
          </Button>
        </View>

        <View style={styles.episodeList}>
          {episodes.map((ep) => (
            <Pressable
              key={ep.id}
              style={({ pressed }) => [
                styles.episodeCard,
                { backgroundColor: theme.backgroundElement },
                ep.watched && { opacity: 0.7 },
                pressed && { opacity: 0.5 },
              ]}
              onPress={() => router.push(`/series/${id}/episode/${ep.id}`)}
            >
              <Pressable
                style={styles.checkbox}
                onPress={() => handleToggle(ep)}
              >
                <ThemedText style={styles.checkIcon}>
                  {ep.watched ? '✅' : '⬜'}
                </ThemedText>
              </Pressable>
              <View style={styles.episodeInfo}>
                <ThemedText type="smallBold">
                  {ep.episodeNumber}. {ep.title || `Episode ${ep.episodeNumber}`}
                </ThemedText>
                {ep.overview && (
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                    {ep.overview}
                  </ThemedText>
                )}
                <View style={styles.episodeMeta}>
                  {ep.runtime && (
                    <ThemedText type="small" themeColor="textSecondary">{ep.runtime}m</ThemedText>
                  )}
                  {ep.isFiller && (
                    <ThemedText type="small" themeColor="textSecondary">Filler</ThemedText>
                  )}
                  {ep.isSpecial && (
                    <ThemedText type="small" themeColor="textSecondary">Special</ThemedText>
                  )}
                  {ep.personalRating && (
                    <ThemedText type="small" themeColor="textSecondary">⭐ {ep.personalRating}</ThemedText>
                  )}
                </View>
              </View>
              {ep.favorite && <ThemedText>❤️</ThemedText>}
            </Pressable>
          ))}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  actions: { flexDirection: 'row', gap: Spacing.three },
  actionButton: { flex: 1 },
  episodeList: { gap: Spacing.two },
  episodeCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three },
  checkbox: { width: 32, alignItems: 'center' },
  checkIcon: { fontSize: 20 },
  episodeInfo: { flex: 1, gap: Spacing.half },
  episodeMeta: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
});

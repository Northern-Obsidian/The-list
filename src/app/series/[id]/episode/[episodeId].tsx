import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase } from '@/db';
import { media, watchHistory } from '@/db/schema';
import {
  getEpisodeDetail,
  markEpisodeWatched,
  markEpisodeUnwatched,
  updateEpisodeRating,
  updateEpisodeNotes,
  toggleEpisodeFavorite,
  type EpisodeItem,
} from '@/services/progress-engine';
import { formatDate } from '@/utils/format';

export default function EpisodeDetailScreen() {
  const { id, episodeId } = useLocalSearchParams<{ id: string; episodeId: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [item, setItem] = useState<(typeof media.$inferSelect) | null>(null);
  const [episode, setEpisode] = useState<EpisodeItem | null>(null);
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [watchHistoryItems, setWatchHistoryItems] = useState<{ id: string; watchedAt: string; durationMinutes: number | null }[]>([]);

  const loadEpisode = useCallback(() => {
    if (!episodeId) return;
    const ep = getEpisodeDetail(episodeId);
    setEpisode(ep);
    if (ep) {
      setRating(ep.personalRating?.toString() || '');
      setNotes(ep.notes || '');
    }

    const { db } = getDatabase();
    const wh = db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.episodeId, episodeId))
      .all();
    setWatchHistoryItems(wh);
  }, [episodeId]);

  useEffect(() => {
    if (!id) return;
    const { db } = getDatabase();
    const result = db.select().from(media).where(eq(media.id, id)).get();
    if (result) setItem(result);
    loadEpisode();
  }, [id, episodeId, loadEpisode]);

  const handleToggleWatched = useCallback(() => {
    if (!episode) return;
    if (episode.watched) {
      markEpisodeUnwatched(episode.id);
    } else {
      markEpisodeWatched(episode.id);
    }
    loadEpisode();
  }, [episode, loadEpisode]);

  const handleSaveRating = useCallback(() => {
    if (!episode) return;
    const val = rating ? parseFloat(rating) : null;
    updateEpisodeRating(episode.id, val);
    loadEpisode();
  }, [episode, rating, loadEpisode]);

  const handleSaveNotes = useCallback(() => {
    if (!episode) return;
    updateEpisodeNotes(episode.id, notes || null);
    loadEpisode();
  }, [episode, notes, loadEpisode]);

  const handleToggleFavorite = useCallback(() => {
    if (!episode) return;
    toggleEpisodeFavorite(episode.id);
    loadEpisode();
  }, [episode, loadEpisode]);

  if (!item || !episode) {
    return <ScreenLoader />;
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Episode {episode.episodeNumber}</ThemedText>
          <View style={{ width: 50 }} />
        </View>

        <ThemedText type="title" style={styles.episodeTitle}>
          {episode.title || `Episode ${episode.episodeNumber}`}
        </ThemedText>

        <ThemedText themeColor="textSecondary">{item.title}</ThemedText>

        <Pressable
          style={({ pressed }) => [
            styles.watchToggle,
            { backgroundColor: episode.watched ? theme.success : theme.backgroundElement },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleToggleWatched}
        >
          <ThemedText style={episode.watched ? { color: '#FFF' } : undefined}>
            {episode.watched ? '✅ Watched' : '⬜ Mark as Watched'}
          </ThemedText>
        </Pressable>

        {episode.overview && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold">Overview</ThemedText>
            <ThemedText>{episode.overview}</ThemedText>
          </ThemedView>
        )}

        <View style={styles.metaRow}>
          {episode.runtime && (
            <ThemedText type="small" themeColor="textSecondary">{episode.runtime} min</ThemedText>
          )}
          {episode.airDate && (
            <ThemedText type="small" themeColor="textSecondary">{formatDate(episode.airDate)}</ThemedText>
          )}
          {episode.isFiller && (
            <ThemedText type="small" themeColor="textSecondary">Filler episode</ThemedText>
          )}
          {episode.isSpecial && (
            <ThemedText type="small" themeColor="textSecondary">Special episode</ThemedText>
          )}
          {episode.isRecap && (
            <ThemedText type="small" themeColor="textSecondary">Recap episode</ThemedText>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.favoriteToggle,
            { backgroundColor: theme.backgroundElement },
            episode.favorite && { backgroundColor: theme.warning },
            pressed && { opacity: 0.7 },
          ]}
          onPress={handleToggleFavorite}
        >
          <ThemedText style={episode.favorite ? { color: '#FFF' } : undefined}>
            {episode.favorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
          </ThemedText>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">Rating</ThemedText>
          <View style={styles.ratingRow}>
            <TextInput
              style={[styles.ratingInput, { color: theme.text, backgroundColor: theme.background }]}
              value={rating}
              onChangeText={setRating}
              placeholder="0-10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
            />
            <Button onPress={handleSaveRating}>Save</Button>
          </View>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">Notes</ThemedText>
          <TextInput
            style={[styles.notesInput, { color: theme.text, backgroundColor: theme.background }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this episode..."
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          <Button onPress={handleSaveNotes}>Save Notes</Button>
        </ThemedView>

        {watchHistoryItems.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold">Watch History</ThemedText>
            {watchHistoryItems.map((wh) => (
              <ThemedText key={wh.id} type="small" themeColor="textSecondary">
                Watched on {formatDate(wh.watchedAt)}
                {wh.durationMinutes ? ` · ${wh.durationMinutes} min` : ''}
              </ThemedText>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  episodeTitle: { fontSize: 28 },
  metaRow: { flexDirection: 'row', gap: Spacing.three, flexWrap: 'wrap' },
  watchToggle: { paddingVertical: Spacing.three, borderRadius: Spacing.three, alignItems: 'center' },
  favoriteToggle: { paddingVertical: Spacing.three, borderRadius: Spacing.three, alignItems: 'center' },
  section: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  ratingRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  ratingInput: { flex: 1, height: 48, borderRadius: Spacing.three, paddingHorizontal: Spacing.four, fontSize: 16 },
  notesInput: { height: 100, borderRadius: Spacing.three, padding: Spacing.four, fontSize: 14, textAlignVertical: 'top' },
});

import { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { eq } from 'drizzle-orm';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { media, series, seasons, episodes, ratings } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import { validateMediaForm } from '@/utils/validation';
import type { MediaFormData, MediaType, WatchStatus } from '@/types/media';
import { SERIES_TYPES } from '@/types/media';

const MEDIA_TYPES: { key: MediaType; label: string }[] = [
  { key: 'movie', label: 'Movie' },
  { key: 'tv_show', label: 'TV Show' },
  { key: 'anime', label: 'Anime' },
  { key: 'documentary', label: 'Doc' },
  { key: 'web_series', label: 'Web Series' },
  { key: 'mini_series', label: 'Mini Series' },
  { key: 'ova', label: 'OVA' },
  { key: 'cartoon', label: 'Cartoon' },
  { key: 'reality_show', label: 'Reality' },
  { key: 'podcast', label: 'Podcast' },
  { key: 'audiobook', label: 'Audiobook' },
  { key: 'book', label: 'Book' },
  { key: 'game', label: 'Game' },
  { key: 'drama', label: 'Drama' },
];

const STATUSES: { key: WatchStatus; label: string }[] = [
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'paused', label: 'Paused' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'rewatching', label: 'Rewatching' },
];

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
  'Thriller', 'Romance', 'Fantasy', 'Mystery', 'Documentary',
  'Animation', 'Musical', 'Western', 'Crime', 'War',
];

export type MediaFormProps = {
  initialData?: Partial<MediaFormData>;
  onSave: () => void;
  onCancel: () => void;
};

export function MediaForm({ initialData, onSave, onCancel }: MediaFormProps) {
  const theme = useTheme();
  const [form, setForm] = useState<MediaFormData>({
    title: initialData?.title || '',
    mediaType: initialData?.mediaType || 'movie',
    status: initialData?.status || 'plan_to_watch',
    overview: initialData?.overview || '',
    year: initialData?.year,
    runtime: initialData?.runtime,
    genres: initialData?.genres || [],
    studio: initialData?.studio || '',
    country: initialData?.country || '',
    language: initialData?.language || '',
    director: initialData?.director || [],
    actors: initialData?.actors || [],
    personalRating: initialData?.personalRating,
    favorite: initialData?.favorite || false,
    notes: initialData?.notes || '',
    originalTitle: initialData?.originalTitle || '',
    totalSeasons: initialData?.totalSeasons,
    totalEpisodes: initialData?.totalEpisodes,
    airStatus: initialData?.airStatus,
    rating: initialData?.rating || { score: undefined, heart: false, thumbsUp: false, masterpiece: false, needRewatch: false },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [directorStr, setDirectorStr] = useState(
    initialData?.director?.join(', ') || '',
  );
  const [actorsStr, setActorsStr] = useState(
    initialData?.actors?.join(', ') || '',
  );
  const isSeries = SERIES_TYPES.includes(form.mediaType);

  const update = useCallback(
    <K extends keyof MediaFormData>(key: K, value: MediaFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const toggleGenre = useCallback(
    (genre: string) => {
      setForm((prev) => {
        const genres = prev.genres?.includes(genre)
          ? prev.genres.filter((g) => g !== genre)
          : [...(prev.genres || []), genre];
        return { ...prev, genres };
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const validation = validateMediaForm(form);
    setErrors(validation.errors);
    if (!validation.valid) return;

    setSaving(true);
    try {
      const { db } = getDatabase();
      const now = new Date().toISOString();
      const profileId = getActiveProfileId();
      const mediaId = form.id || generateId();
      const isUpdate = !!form.id;

      const mediaValues = {
        profileId,
        mediaType: form.mediaType,
        title: form.title,
        originalTitle: form.originalTitle || null,
        overview: form.overview || null,
        year: form.year || null,
        runtime: form.runtime || null,
        genres: form.genres?.length ? JSON.stringify(form.genres) : null,
        studio: form.studio || null,
        country: form.country || null,
        language: form.language || null,
        director: directorStr || null,
        actors: actorsStr || null,
        status: form.status,
        personalRating: form.personalRating || null,
        favorite: !!form.favorite,
        notes: form.notes || null,
        updatedAt: now,
      };

      if (isUpdate) {
        db.update(media).set(mediaValues).where(eq(media.id, mediaId)).run();
      } else {
        db.insert(media).values({ ...mediaValues, id: mediaId, createdAt: now }).run();
      }

      if (isSeries) {
        const seasonCount = form.totalSeasons || 0;
        const episodeCountTotal = form.totalEpisodes || 0;
        const episodesPerSeason = seasonCount > 0 ? Math.ceil(episodeCountTotal / seasonCount) : 0;

        if (isUpdate) {
          db.update(series)
            .set({
              totalSeasons: seasonCount,
              totalEpisodes: episodeCountTotal,
              airStatus: (form.airStatus || null) as 'airing' | 'completed' | 'upcoming' | null,
            })
            .where(eq(series.id, mediaId))
            .run();
        } else if (seasonCount || episodeCountTotal) {
          db.insert(series)
            .values({
              id: mediaId,
              totalSeasons: seasonCount,
              totalEpisodes: episodeCountTotal,
              airStatus: (form.airStatus || null) as 'airing' | 'completed' | 'upcoming' | null,
            })
            .run();
        }

        if (!isUpdate && seasonCount > 0) {
          for (let s = 1; s <= seasonCount; s++) {
            const seasonId = generateId();
            const epCount = s === seasonCount
              ? episodeCountTotal - (episodesPerSeason * (seasonCount - 1))
              : episodesPerSeason;
            db.insert(seasons)
              .values({
                id: seasonId,
                seriesId: mediaId,
                seasonNumber: s,
                episodeCount: Math.max(epCount, 0),
              })
              .run();
            if (epCount > 0) {
              for (let e = 1; e <= epCount; e++) {
                db.insert(episodes)
                  .values({
                    id: generateId(),
                    seriesId: mediaId,
                    seasonId,
                    episodeNumber: e,
                  })
                  .run();
              }
            }
          }
        }
      }

      // Save rating to ratings table
      const ratingScore = form.personalRating || form.rating?.score;
      if (ratingScore) {
        const ratingData = form.rating as { heart?: boolean; thumbsUp?: boolean; masterpiece?: boolean; needRewatch?: boolean } || {};
        const existingRating = db.select().from(ratings).where(eq(ratings.mediaId, mediaId)).get();
        if (existingRating) {
          db.update(ratings)
            .set({
              score: ratingScore,
              heart: ratingData.heart ?? false,
              thumbsUp: ratingData.thumbsUp ?? false,
              masterpiece: ratingData.masterpiece ?? false,
              needRewatch: ratingData.needRewatch ?? false,
              updatedAt: now,
            })
            .where(eq(ratings.mediaId, mediaId))
            .run();
        } else {
          db.insert(ratings)
            .values({
              id: generateId(),
              mediaId,
              profileId,
              score: ratingScore,
              heart: ratingData.heart ?? false,
              thumbsUp: ratingData.thumbsUp ?? false,
              masterpiece: ratingData.masterpiece ?? false,
              needRewatch: ratingData.needRewatch ?? false,
              createdAt: now,
              updatedAt: now,
            })
            .run();
        }
      }

      onSave();
    } catch {
      setErrors({ title: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [form, directorStr, actorsStr, isSeries, onSave]);

  const isSeriesType = isSeries;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.form}>
        <Input
          label="Title *"
          value={form.title}
          onChangeText={(v) => update('title', v)}
          placeholder="Enter title"
          error={errors.title}
          autoFocus
        />

        <Input
          label="Original Title"
          value={form.originalTitle || ''}
          onChangeText={(v) => update('originalTitle', v)}
          placeholder="Original title (if different)"
        />

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
            Type
          </ThemedText>
          <View style={styles.chipGrid}>
            {MEDIA_TYPES.map((t) => (
              <View key={t.key} style={styles.chipCell}>
                <Chip
                  label={t.label}
                  selected={form.mediaType === t.key}
                  onPress={() => update('mediaType', t.key)}
                  fullWidth
                />
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
            Status
          </ThemedText>
          <View style={styles.chipGrid}>
            {STATUSES.map((s) => (
              <View key={s.key} style={styles.chipCell}>
                <Chip
                  label={s.label}
                  selected={form.status === s.key}
                  onPress={() => update('status', s.key)}
                  fullWidth
                />
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Year"
              value={form.year?.toString() || ''}
              onChangeText={(v) => update('year', v ? parseInt(v) || undefined : undefined)}
              placeholder="e.g. 2024"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Runtime (min)"
              value={form.runtime?.toString() || ''}
              onChangeText={(v) => update('runtime', v ? parseInt(v) || undefined : undefined)}
              placeholder="e.g. 120"
              keyboardType="number-pad"
            />
          </View>
        </ThemedView>

        {isSeriesType && (
          <>
            <ThemedView style={styles.row}>
              <View style={styles.halfField}>
                <Input
                  label="Total Seasons"
                  value={form.totalSeasons?.toString() || ''}
                  onChangeText={(v) => update('totalSeasons', v ? parseInt(v) || undefined : undefined)}
                  placeholder="e.g. 5"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Total Episodes"
                  value={form.totalEpisodes?.toString() || ''}
                  onChangeText={(v) => update('totalEpisodes', v ? parseInt(v) || undefined : undefined)}
                  placeholder="e.g. 62"
                  keyboardType="number-pad"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.fieldGroup}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
                Air Status
              </ThemedText>
              <View style={styles.chipGrid}>
                {[{ key: '', label: 'N/A' }, { key: 'airing', label: 'Airing' }, { key: 'completed', label: 'Completed' }, { key: 'upcoming', label: 'Upcoming' }].map((opt) => (
                  <View key={opt.key} style={styles.chipCell}>
                    <Chip
                      label={opt.label}
                      selected={(form.airStatus || '') === opt.key}
                      onPress={() => update('airStatus', opt.key || undefined)}
                      fullWidth
                    />
                  </View>
                ))}
              </View>
            </ThemedView>
          </>
        )}

        <Input
          label="Overview"
          value={form.overview || ''}
          onChangeText={(v) => update('overview', v)}
          placeholder="Brief description"
          multiline
          characterCount
          maxLength={1000}
        />

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
            Genres
          </ThemedText>
          <View style={styles.chipGrid}>
            {GENRE_OPTIONS.map((g) => (
              <View key={g} style={styles.chipCell}>
                <Chip
                  label={g}
                  selected={form.genres?.includes(g)}
                  onPress={() => toggleGenre(g)}
                  fullWidth
                />
              </View>
            ))}
          </View>
        </ThemedView>

        <ThemedView style={styles.row}>
          <View style={styles.halfField}>
            <Input
              label="Studio"
              value={form.studio || ''}
              onChangeText={(v) => update('studio', v)}
              placeholder="Studio name"
            />
          </View>
          <View style={styles.halfField}>
            <Input
              label="Country"
              value={form.country || ''}
              onChangeText={(v) => update('country', v)}
              placeholder="e.g. USA"
            />
          </View>
        </ThemedView>

        <Input
          label="Language"
          value={form.language || ''}
          onChangeText={(v) => update('language', v)}
          placeholder="e.g. English"
        />

        <Input
          label="Director(s)"
          value={directorStr}
          onChangeText={setDirectorStr}
          placeholder="Comma-separated names"
        />

        <Input
          label="Actors"
          value={actorsStr}
          onChangeText={setActorsStr}
          placeholder="Comma-separated names"
          multiline
        />

        <ThemedView style={styles.fieldGroup}>
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.fieldLabel}>
            Rating
          </ThemedText>
          <Input
            label="Star Rating (0-10)"
            value={form.personalRating?.toString() || ''}
            onChangeText={(v) => update('personalRating', v ? parseFloat(v) || undefined : undefined)}
            placeholder="e.g. 8.5"
            keyboardType="decimal-pad"
          />
          <View style={styles.ratingRow}>
            <Pressable
              style={({ pressed }) => [styles.ratingToggle, { backgroundColor: theme.backgroundElement }, form.rating?.heart && { backgroundColor: theme.error }, pressed && { opacity: 0.7 }]}
              onPress={() => update('rating', { ...form.rating!, heart: !form.rating?.heart })}
              accessibilityRole="switch"
              accessibilityState={{ checked: !!form.rating?.heart }}
              accessibilityLabel="Love it"
            >
              <ThemedText style={form.rating?.heart ? { color: '#FFF' } : undefined}>❤️</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ratingToggle, { backgroundColor: theme.backgroundElement }, form.rating?.thumbsUp && { backgroundColor: theme.primary }, pressed && { opacity: 0.7 }]}
              onPress={() => update('rating', { ...form.rating!, thumbsUp: !form.rating?.thumbsUp })}
              accessibilityRole="switch"
              accessibilityState={{ checked: !!form.rating?.thumbsUp }}
              accessibilityLabel="Thumbs up"
            >
              <ThemedText style={form.rating?.thumbsUp ? { color: '#FFF' } : undefined}>👍</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ratingToggle, { backgroundColor: theme.backgroundElement }, form.rating?.masterpiece && { backgroundColor: theme.warning }, pressed && { opacity: 0.7 }]}
              onPress={() => update('rating', { ...form.rating!, masterpiece: !form.rating?.masterpiece })}
              accessibilityRole="switch"
              accessibilityState={{ checked: !!form.rating?.masterpiece }}
              accessibilityLabel="Masterpiece"
            >
              <ThemedText style={form.rating?.masterpiece ? { color: '#FFF' } : undefined}>🏆</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ratingToggle, { backgroundColor: theme.backgroundElement }, form.rating?.needRewatch && { backgroundColor: theme.success }, pressed && { opacity: 0.7 }]}
              onPress={() => update('rating', { ...form.rating!, needRewatch: !form.rating?.needRewatch })}
              accessibilityRole="switch"
              accessibilityState={{ checked: !!form.rating?.needRewatch }}
              accessibilityLabel="Need a rewatch"
            >
              <ThemedText style={form.rating?.needRewatch ? { color: '#FFF' } : undefined}>🔄</ThemedText>
            </Pressable>
          </View>
        </ThemedView>

        <Pressable
          style={({ pressed }) => [
            styles.favoriteToggle,
            { backgroundColor: theme.backgroundElement },
            form.favorite && { backgroundColor: theme.primary },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => update('favorite', !form.favorite)}
          accessibilityRole="switch"
          accessibilityState={{ checked: form.favorite }}
          accessibilityLabel={form.favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <ThemedText style={form.favorite ? { color: '#FFF' } : undefined}>
            {form.favorite ? '❤️ Favorite' : '🤍 Add to Favorites'}
          </ThemedText>
        </Pressable>

        <Input
          label="Notes"
          value={form.notes || ''}
          onChangeText={(v) => update('notes', v)}
          placeholder="Personal notes"
          multiline
          characterCount
          maxLength={2000}
        />

        <ThemedView style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? 'Saving...' : initialData ? 'Update' : 'Add'}
          </Button>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  form: { flex: 1, maxWidth: MaxContentWidth, paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  fieldGroup: { gap: Spacing.two },
  fieldLabel: { marginLeft: Spacing.one, fontSize: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chipCell: { minWidth: 90, flexGrow: 1, flexBasis: '30%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  halfField: { flex: 1 },
  ratingRow: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  ratingToggle: { width: 48, height: 48, borderRadius: Spacing.three, justifyContent: 'center', alignItems: 'center' },
  favoriteToggle: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.four, borderRadius: Spacing.three, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.three },
  actionButton: { flex: 1 },
});

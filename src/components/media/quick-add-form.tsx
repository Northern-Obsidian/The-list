import { useState, useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '@/components/ui/button';
import { Icon, iconForMediaType } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { media, series, seasons, episodes } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import type { MediaType } from '@/types/media';
import { HAS_SEASONS } from '@/types/media';

const QUICK_TYPES: { key: MediaType; label: string }[] = [
  { key: 'movie', label: 'Movie' },
  { key: 'anime', label: 'Anime' },
  { key: 'cartoon', label: 'Animation' },
  { key: 'tv_show', label: 'Series' },
  { key: 'drama', label: 'Drama' },
];

export type QuickAddFormProps = {
  onSave: () => void;
  onCancel: () => void;
  onFullForm?: () => void;
};

export function QuickAddForm({ onSave, onCancel, onFullForm }: QuickAddFormProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [typeKey, setTypeKey] = useState<MediaType>('movie');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [totalSeasons, setTotalSeasons] = useState('');
  const [totalEpisodes, setTotalEpisodes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasSeasons = HAS_SEASONS.has(typeKey);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission to access gallery is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Name is required';
    if (hasSeasons) {
      if (totalSeasons && (isNaN(Number(totalSeasons)) || Number(totalSeasons) < 1)) {
        newErrors.seasons = 'Enter a valid number';
      }
      if (totalEpisodes && (isNaN(Number(totalEpisodes)) || Number(totalEpisodes) < 1)) {
        newErrors.episodes = 'Enter a valid number';
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const { db } = getDatabase();
      const now = new Date().toISOString();
      const mediaId = generateId();
      const mediaType = typeKey;
      const profileId = getActiveProfileId();
      const seasonCount = totalSeasons ? parseInt(totalSeasons) : 0;
      const episodeCountTotal = totalEpisodes ? parseInt(totalEpisodes) : 0;

      db.insert(media)
        .values({
          id: mediaId,
          profileId,
          mediaType,
          title: title.trim(),
          posterPath: imageUri || null,
          status: 'plan_to_watch',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      if (hasSeasons && (seasonCount || episodeCountTotal)) {
        db.insert(series)
          .values({
            id: mediaId,
            totalSeasons: seasonCount,
            totalEpisodes: episodeCountTotal,
          })
          .run();

        if (seasonCount > 0) {
          const episodesPerSeason = Math.ceil(episodeCountTotal / seasonCount);
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

      onSave();
    } catch {
      setErrors({ title: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [title, typeKey, imageUri, totalSeasons, totalEpisodes, hasSeasons, onSave]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.form}>
        <ThemedView style={styles.section}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
            Type
          </ThemedText>
          <View style={styles.radioGroup}>
            {QUICK_TYPES.map((t) => (
              <Pressable
                key={t.key}
                style={({ pressed }) => [
                  styles.radioOption,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: typeKey === t.key ? theme.primary : 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setTypeKey(t.key);
                  clearError('type');
                }}
              >
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: typeKey === t.key ? theme.primary : theme.textTertiary },
                  ]}
                >
                  {typeKey === t.key && (
                    <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                  )}
                </View>
                <Icon name={iconForMediaType(t.key)} size={18} color={theme.textSecondary} />
                <ThemedText type="small">{t.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>

        <Input
          label="Name *"
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            clearError('title');
          }}
          placeholder="Enter name"
          error={errors.title}
          autoFocus
        />

        <Pressable
          style={({ pressed }) => [
            styles.imagePicker,
            { backgroundColor: theme.backgroundElement, borderColor: theme.borderLight },
            pressed && { opacity: 0.7 },
          ]}
          onPress={pickImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <ThemedText themeColor="textSecondary">+ Tap to select image</ThemedText>
          )}
        </Pressable>

        {hasSeasons && (
          <ThemedView style={styles.seasonsSection}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
              Seasons & Episodes
            </ThemedText>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Input
                  label="Seasons"
                  value={totalSeasons}
                  onChangeText={(v) => {
                    setTotalSeasons(v);
                    clearError('seasons');
                  }}
                  placeholder="e.g. 3"
                  keyboardType="number-pad"
                  error={errors.seasons}
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Episodes"
                  value={totalEpisodes}
                  onChangeText={(v) => {
                    setTotalEpisodes(v);
                    clearError('episodes');
                  }}
                  placeholder="e.g. 24"
                  keyboardType="number-pad"
                  error={errors.episodes}
                />
              </View>
            </View>
          </ThemedView>
        )}

        {error ? (
          <ThemedText style={[styles.errorText, { color: theme.error }]}>{error}</ThemedText>
        ) : null}

        <ThemedView style={styles.actions}>
          <Button variant="secondary" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={saving} style={styles.actionButton}>
            {saving ? 'Saving...' : 'Add'}
          </Button>
        </ThemedView>

        {onFullForm && (
          <Pressable
            style={({ pressed }) => [styles.fullFormLink, pressed && { opacity: 0.7 }]}
            onPress={onFullForm}
          >
            <ThemedText themeColor="textSecondary" type="small">
              or add with full details →
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  label: {
    marginLeft: Spacing.one,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 2,
    minWidth: '30%',
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  imagePicker: {
    height: 160,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: Spacing.three,
  },
  seasonsSection: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  halfField: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
  },
  fullFormLink: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

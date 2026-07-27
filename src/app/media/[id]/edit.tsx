import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { MediaForm } from '@/components/media/media-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getMediaById } from '@/db/queries';
import type { MediaFormData } from '@/types/media';

export default function EditMediaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [initialData, setInitialData] = useState<MediaFormData | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const mediaItem = getMediaById(id);
    if (mediaItem) {
      setInitialData({
        id: mediaItem.id,
        title: mediaItem.title,
        mediaType: mediaItem.mediaType,
        status: mediaItem.status,
        overview: mediaItem.overview || '',
        year: mediaItem.year || undefined,
        runtime: mediaItem.runtime || undefined,
        genres: mediaItem.genres ? JSON.parse(mediaItem.genres) : [],
        studio: mediaItem.studio || '',
        country: mediaItem.country || '',
        language: mediaItem.language || '',
        director: mediaItem.director ? mediaItem.director.split(',').map((s) => s.trim()).filter(Boolean) : [],
        actors: mediaItem.actors ? mediaItem.actors.split(',').map((s) => s.trim()).filter(Boolean) : [],
        personalRating: mediaItem.personalRating || undefined,
        favorite: !!mediaItem.favorite,
        notes: mediaItem.notes || '',
        originalTitle: mediaItem.originalTitle || '',
      });
    }
  }, [id]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Cancel</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">Edit Media</ThemedText>
        <ThemedView style={{ width: 50 }} />
      </ThemedView>
      {initialData && (
        <MediaForm
          initialData={initialData}
          onSave={() => router.back()}
          onCancel={() => router.back()}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingVertical: Spacing.four,
  },
});

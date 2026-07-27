import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { MediaForm } from '@/components/media/media-form';
import { QuickAddForm } from '@/components/media/quick-add-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { MediaType } from '@/types/media';

const MEDIA_TYPES: { key: MediaType; icon: string; label: string }[] = [
  { key: 'movie', icon: '🎬', label: 'Movie' },
  { key: 'tv_show', icon: '📺', label: 'TV Show' },
  { key: 'anime', icon: '📖', label: 'Anime' },
  { key: 'documentary', icon: '🎥', label: 'Documentary' },
  { key: 'web_series', icon: '📹', label: 'Web Series' },
  { key: 'mini_series', icon: '🎞️', label: 'Mini Series' },
  { key: 'ova', icon: '💿', label: 'OVA' },
  { key: 'cartoon', icon: '🖍️', label: 'Cartoon' },
  { key: 'reality_show', icon: '📺', label: 'Reality' },
  { key: 'podcast', icon: '🎙️', label: 'Podcast' },
  { key: 'audiobook', icon: '🎧', label: 'Audiobook' },
  { key: 'book', icon: '📕', label: 'Book' },
  { key: 'game', icon: '🎮', label: 'Game' },
  { key: 'drama', icon: '🎭', label: 'Drama' },
];

type Mode = 'picker' | 'quick' | 'full';

export default function NewMediaScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('picker');
  const [selectedType, setSelectedType] = useState<MediaType>('movie');

  const handleTypeSelect = (type: MediaType) => {
    setSelectedType(type);
    setMode('quick');
  };

  if (mode === 'quick') {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => setMode('picker')}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Quick Add</ThemedText>
          <ThemedView style={{ width: 50 }} />
        </ThemedView>
        <QuickAddForm
          onSave={() => router.back()}
          onCancel={() => router.back()}
          onFullForm={() => setMode('full')}
        />
      </ThemedView>
    );
  }

  if (mode === 'full') {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => setMode('picker')}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Add {selectedType.replace(/_/g, ' ')}</ThemedText>
          <ThemedView style={{ width: 50 }} />
        </ThemedView>
        <MediaForm
          initialData={{ mediaType: selectedType }}
          onSave={() => router.back()}
          onCancel={() => router.back()}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Cancel</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">Add Media</ThemedText>
        <ThemedView style={{ width: 50 }} />
      </ThemedView>

      <ThemedText themeColor="textSecondary" style={styles.prompt}>
        What are you adding?
      </ThemedText>

      <ThemedView style={styles.grid}>
        {MEDIA_TYPES.map((type) => (
          <Pressable
            key={type.key}
            style={({ pressed }) => [
              styles.typeCard,
              { backgroundColor: 'transparent', borderColor: 'rgba(128,128,128,0.2)' },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleTypeSelect(type.key)}
          >
            <ThemedText style={styles.typeIcon}>{type.icon}</ThemedText>
            <ThemedText type="small">{type.label}</ThemedText>
          </Pressable>
        ))}
      </ThemedView>
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
  prompt: {
    textAlign: 'center',
    fontSize: 18,
    marginVertical: Spacing.five,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
  },
  typeIcon: {
    fontSize: 36,
  },
});

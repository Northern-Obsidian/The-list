import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon, iconForMediaType } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useScalePress } from '@/utils/micro-interactions';

export type MediaCardItem = {
  id: string;
  title: string;
  mediaType: string;
  status: string;
  year: number | null;
  personalRating: number | null;
  genres: string | null;
  posterPath: string | null;
};

type Props = {
  item: MediaCardItem;
  variant?: 'grid' | 'list';
};

const STATUS_COLORS: Record<string, string> = {
  watching: '#3C9FFE',
  completed: '#34D399',
  paused: '#FBBF24',
  dropped: '#F87171',
  plan_to_watch: '#9CA3AF',
  rewatching: '#A78BFA',
};

function MediaCardComponent({ item, variant = 'list' }: Props) {
  const theme = useTheme();
  const { scale, onPressIn, onPressOut } = useScalePress();

  const handlePress = () => {
    router.push(`/media/${item.id}`);
  };

  const genres = item.genres ? (JSON.parse(item.genres) as string[]) : [];
  const iconName = iconForMediaType(item.mediaType);

  if (variant === 'grid') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.gridCard,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.mediaType.replace('_', ' ')}${item.year ? `, ${item.year}` : ''}`}
      >
        <ThemedView style={[styles.gridPoster, { backgroundColor: theme.background }]}>
          <Icon name={iconName} size={40} color={theme.textSecondary} />
        </ThemedView>
        <ThemedView style={styles.gridInfo}>
          <ThemedText type="caption" numberOfLines={2} style={styles.gridTitle}>
            {item.title}
          </ThemedText>
          {item.year && (
            <ThemedText themeColor="textSecondary" type="caption">
              {item.year}
            </ThemedText>
          )}
          {item.personalRating && (
            <ThemedText themeColor="textSecondary" type="caption">
              {item.personalRating}
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
    <Pressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.listCard,
        { backgroundColor: theme.backgroundElement },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.mediaType.replace('_', ' ')}, ${item.status.replace('_', ' ')}${item.year ? `, ${item.year}` : ''}`}
    >
      <ThemedView style={[styles.listPoster, { backgroundColor: theme.background }]}>
        <Icon name={iconName} size={24} color={theme.textSecondary} />
      </ThemedView>
      <ThemedView style={styles.listContent}>
        <ThemedText type="label" numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedView style={styles.listMeta}>
          <ThemedText themeColor="textSecondary" type="caption">
            {item.mediaType.replace('_', ' ')}
          </ThemedText>
          {item.year && (
            <ThemedText themeColor="textSecondary" type="caption">
              · {item.year}
            </ThemedText>
          )}
          {item.personalRating && (
            <ThemedText themeColor="textSecondary" type="caption">
              · {item.personalRating}
            </ThemedText>
          )}
        </ThemedView>
        {genres.length > 0 && (
          <ThemedText themeColor="textSecondary" type="caption" numberOfLines={1}>
            {genres.slice(0, 3).join(', ')}
          </ThemedText>
        )}
      </ThemedView>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: STATUS_COLORS[item.status] || '#9CA3AF' },
        ]}
        accessibilityElementsHidden
      />
    </Pressable>
    </Animated.View>
  );
}

export const MediaCard = memo(MediaCardComponent);

const styles = StyleSheet.create({
  listCard: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: 'center',
  },
  listPoster: {
    width: 48,
    height: 64,
    borderRadius: Spacing.two,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    gap: Spacing.half,
  },
  listMeta: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridCard: {
    flex: 1,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  gridPoster: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInfo: {
    padding: Spacing.two,
    gap: Spacing.half,
  },
  gridTitle: {
    lineHeight: 18,
  },
});

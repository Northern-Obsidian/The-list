import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';
import { collections } from '@/db/schema';
import { getCollectionsWithCounts } from '@/db/queries';

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

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
  const [collectionList, setCollectionList] = useState<(typeof collections.$inferSelect & { itemCount: number })[]>([]);

  useEffect(() => {
    setCollectionList(getCollectionsWithCounts());
  }, []);

  const renderItem = ({ item }: { item: typeof collectionList[0] }) => (
    <ScalePressable
      onPress={() => { haptics.light(); router.push(`/collections/${item.id}`); }}
    >
      <ThemedView
        style={[
          styles.collectionCard,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        <Icon name={item.icon || 'folder'} size={32} color={theme.textSecondary} />
        <ThemedText style={styles.cardName} numberOfLines={1}>{item.name}</ThemedText>
        <ThemedText style={styles.cardCount} themeColor="textSecondary">
          {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
        </ThemedText>
        {item.isSmart && (
          <ThemedView style={[styles.smartBadge, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.smartBadgeText}>Smart</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ScalePressable>
  );

  return (
    <FlatList
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
      data={collectionList}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
          <ThemedView style={styles.header}>
            <Pressable
              style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
              onPress={() => { haptics.light(); router.back(); }}
            >
              <Icon name="arrow-left" size={20} color={theme.text} />
            </Pressable>
            <ThemedText style={styles.title}>Collections</ThemedText>
            <Pressable onPress={() => { haptics.light(); router.push('/collections/new'); }}>
              <Icon name="plus" size={20} color={theme.text} />
            </Pressable>
          </ThemedView>
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedView style={styles.emptyState}>
          <Icon name="folder" size={64} color={theme.textSecondary} />
          <ThemedText themeColor="textSecondary">
            No collections yet. Create your first collection to organize your library.
          </ThemedText>
        </ThemedView>
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.four },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700' },
  row: { gap: Spacing.two, marginBottom: Spacing.two },
  collectionCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
  },
  cardName: { fontSize: 13, fontWeight: '600', textAlign: 'center' as const },
  cardCount: { fontSize: 11 },
  smartBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  smartBadgeText: { fontSize: 10 },
  emptyState: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
});

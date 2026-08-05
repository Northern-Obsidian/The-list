import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/hooks/use-theme';
import {
  getUserAchievements,
  getAchievementStats,
  checkAndUnlockAchievements,
  type Achievement,
} from '@/services/achievement-engine';

const CATEGORY_LABELS: Record<string, string> = {
  collection: 'Collection',
  completion: 'Completion',
  episodes: 'Episodes',
  streaks: 'Streaks',
  reviews: 'Reviews',
  ratings: 'Ratings',
  favorites: 'Favorites',
  diversity: 'Diversity',
  fun: 'Hidden',
  rewatches: 'Rewatches',
  backup: 'Backup',
  collections: 'Collections',
};

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, percentage: 0 });

  useEffect(() => {
    checkAndUnlockAchievements();
    setAchievements(getUserAchievements());
    setStats(getAchievementStats());
  }, []);

  const sections = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {};
    for (const ach of achievements) {
      const cat = ach.category || 'other';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ach);
    }
    return Object.entries(grouped)
      .map(([category, data]) => ({
        title: CATEGORY_LABELS[category] || category,
        data,
      }))
      .sort((a, b) => b.data.filter((x) => !x.unlockedAt).length - a.data.filter((x) => !x.unlockedAt).length);
  }, [achievements]);

  const renderAchievement = useCallback(
    ({ item }: { item: Achievement }) => {
      const isUnlocked = !!item.unlockedAt;
      const progress = item.progressTarget > 0 ? (item.progressCurrent / item.progressTarget) * 100 : 0;

      return (
        <ThemedView
          type="backgroundElement"
          style={styles.achievementCard}
        >
          {isUnlocked && (
            <View style={styles.checkBadge}>
              <Icon name="check" size={16} color={theme.success} />
            </View>
          )}
          <ThemedText style={styles.achievementIcon}>{item.icon}</ThemedText>
          <ThemedText
            style={styles.achievementTitle}
            numberOfLines={1}
          >
            {isUnlocked || !item.isSecret ? item.title : '???'}
          </ThemedText>
          <ThemedText
            themeColor="textSecondary"
            style={[styles.achievementDesc, item.isSecret && !isUnlocked ? { opacity: 0.4 } : undefined]}
            numberOfLines={2}
          >
            {isUnlocked || !item.isSecret ? item.description : 'Secret achievement'}
          </ThemedText>
          <View style={[styles.miniProgress, { backgroundColor: theme.background }]}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isUnlocked ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText} themeColor="textSecondary">
            {item.progressCurrent}/{item.progressTarget}
          </ThemedText>
        </ThemedView>
      );
    },
    [theme],
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: insets.bottom + Spacing.five }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => { haptics.light(); router.back(); }} style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
            <Icon name="arrow-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Achievements</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <ThemedView type="backgroundElement" style={styles.statsCard}>
          <ThemedText style={styles.statsNumber}>
            {stats.unlocked}/{stats.total}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.statsLabel}>Achievements Unlocked</ThemedText>
          <View style={styles.statsProgressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(stats.percentage * 100)}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.statsPercentage} themeColor="textSecondary">
              {Math.round(stats.percentage * 100)}%
            </ThemedText>
          </View>
        </ThemedView>

        {sections.map((section) => {
          const unlocked = section.data.filter((a) => a.unlockedAt).length;
          return (
            <ThemedView key={section.title} style={styles.section}>
              <ThemedText themeColor="textSecondary" style={styles.sectionTitle}>
                {section.title} ({unlocked}/{section.data.length})
              </ThemedText>
              <FlatList
                data={section.data}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.key}
                numColumns={2}
                columnWrapperStyle={styles.gridRow}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
              />
            </ThemedView>
          );
        })}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: Spacing.two,
  },
  statsNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: 14,
  },
  statsProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: Spacing.two,
  },
  statsPercentage: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { gap: Spacing.three },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  gridRow: {
    gap: Spacing.two,
  },
  achievementCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  achievementIcon: { fontSize: 28 },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  achievementDesc: {
    fontSize: 11,
  },
  miniProgress: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
  },
});

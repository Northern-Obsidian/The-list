import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { MaxContentWidth, Spacing } from '@/constants/theme';
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
          style={[styles.achievementCard, isUnlocked && styles.unlockedCard]}
        >
          <ThemedText style={styles.achievementIcon}>{item.icon}</ThemedText>
          <View style={styles.achievementInfo}>
            <ThemedText type="smallBold" style={!isUnlocked && item.isSecret ? { opacity: 0.4 } : undefined}>
              {isUnlocked || !item.isSecret ? item.title : '???'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={item.isSecret && !isUnlocked ? { opacity: 0.4 } : undefined}>
              {isUnlocked || !item.isSecret ? item.description : 'Secret achievement'}
            </ThemedText>
            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: isUnlocked ? theme.success : theme.primary,
                    },
                  ]}
                />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {item.progressCurrent}/{item.progressTarget}
              </ThemedText>
            </View>
          </View>
          {isUnlocked && <Icon name="checkmark" size={20} color={theme.success} />}
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
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Achievements</ThemedText>
          <View style={{ width: 50 }} />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.statsCard}>
          <ThemedText type="title" style={styles.statsNumber}>
            {stats.unlocked}/{stats.total}
          </ThemedText>
          <ThemedText themeColor="textSecondary">Achievements Unlocked</ThemedText>
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
        </ThemedView>

        {sections.map((section) => {
          const unlocked = section.data.filter((a) => a.unlockedAt).length;
          return (
            <ThemedView key={section.title} style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {section.title} ({unlocked}/{section.data.length})
              </ThemedText>
              <View style={styles.achievementList}>
                {section.data.map((ach) => (
                  <View key={ach.key}>{renderAchievement({ item: ach })}</View>
                ))}
              </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  statsCard: { borderRadius: Spacing.four, padding: Spacing.five, alignItems: 'center', gap: Spacing.two },
  statsNumber: { fontSize: 48 },
  progressBar: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { gap: Spacing.three },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  achievementList: { gap: Spacing.two },
  achievementCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.three },
  unlockedCard: { opacity: 0.9 },
  achievementIcon: { fontSize: 28 },
  achievementInfo: { flex: 1, gap: Spacing.half },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  unlockedBadge: { fontSize: 20 },
});

import { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getLibraryStats,
  getGenreDistribution,
  getMonthlyActivity,
  getStreakData,
  getRatingDistribution,
  type LibraryStats,
  type GenreStat,
  type MonthlyActivity,
  type StreakData,
} from '@/services/stats-engine';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [monthly, setMonthly] = useState<MonthlyActivity[]>([]);
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [ratingDist, setRatingDist] = useState<{ rating: number; count: number }[]>([]);

  useEffect(() => {
    setStats(getLibraryStats());
    setGenres(getGenreDistribution());
    setMonthly(getMonthlyActivity());
    setStreaks(getStreakData());
    setRatingDist(getRatingDistribution());
  }, []);

  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  if (!stats) return null;

  const completedPercent = stats.totalItems > 0
    ? Math.round((stats.byStatus['completed'] || 0) / stats.totalItems * 100)
    : 0;

  const topGenres = genres.slice(0, 8);
  const maxGenreCount = Math.max(...topGenres.map((g) => g.count), 1);

  const maxRatingCount = Math.max(...ratingDist.map((r) => r.count), 1);

  const maxMonthlyCount = Math.max(...monthly.map((m) => m.count), 1);

  return (
    <ErrorBoundary name="StatsScreen">
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        contentInset={{ bottom: paddingBottom }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.container, { paddingTop: insets.top + Spacing.three }]}>
          <ThemedText style={styles.headerTitle}>Insights</ThemedText>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.summaryValue, { color: theme.text }]}>{stats.totalItems}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Items</ThemedText>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.summaryValue, { color: theme.text }]}>{stats.totalHoursWatched}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Hours Watched</ThemedText>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={[styles.summaryValue, { color: theme.text }]}>{completedPercent}%</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>Completed %</ThemedText>
            </View>
          </View>

          {topGenres.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>Genre Distribution</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barScrollContent}>
                {topGenres.map((g, i) => {
                  const barHeight = maxGenreCount > 0 ? (g.count / maxGenreCount) * 120 : 0;
                  return (
                    <View key={i} style={styles.barItem}>
                      <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
                        <View style={[styles.barFill, { height: barHeight, backgroundColor: theme.primary }]} />
                      </View>
                      <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>{g.genre}</ThemedText>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {ratingDist.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>Rating Distribution</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barScrollContent}>
                {ratingDist.map((r, i) => {
                  const barHeight = maxRatingCount > 0 ? (r.count / maxRatingCount) * 120 : 0;
                  return (
                    <View key={i} style={styles.barItem}>
                      <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
                        <View style={[styles.barFill, { height: barHeight, backgroundColor: theme.warning }]} />
                      </View>
                      <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]}>{r.rating}</ThemedText>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {monthly.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>Monthly Activity</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barScrollContent}>
                {monthly.map((m, i) => {
                  const barHeight = maxMonthlyCount > 0 ? (m.count / maxMonthlyCount) * 120 : 0;
                  return (
                    <View key={i} style={styles.barItem}>
                      <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
                        <View style={[styles.barFill, { height: barHeight, backgroundColor: theme.success }]} />
                      </View>
                      <ThemedText style={[styles.barLabel, { color: theme.textSecondary }]} numberOfLines={1}>{m.month.slice(5)}</ThemedText>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {streaks && (
            <View style={styles.streakRow}>
              <View style={[styles.streakCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={[styles.streakValue, { color: theme.text }]}>{streaks.currentStreak}</ThemedText>
                <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</ThemedText>
              </View>
              <View style={[styles.streakCard, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText style={[styles.streakValue, { color: theme.text }]}>{streaks.longestStreak}</ThemedText>
                <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>Longest Streak</ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  barScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  barItem: {
    width: 40,
    alignItems: 'center',
  },
  barTrack: {
    width: 40,
    height: 120,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  streakCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.four,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 13,
    marginTop: 4,
  },
});

import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorBoundary } from '@/components/error-boundary';
import { BarChart } from '@/components/ui/bar-chart';
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

  return (
    <ErrorBoundary name="StatsScreen">
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: paddingBottom }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Statistics</ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Your watching habits at a glance
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.summaryGrid}>
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <ThemedText type="title" style={styles.cardValue}>{stats.totalItems}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Total</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <ThemedText type="title" style={styles.cardValue}>{stats.totalMovies}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Movies</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <ThemedText type="title" style={styles.cardValue}>{stats.totalShows}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Shows</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <ThemedText type="title" style={styles.cardValue}>{stats.totalEpisodesWatched}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Episodes</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={styles.statBlock}>
            <ThemedText type="smallBold">{stats.totalHoursWatched}h</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Hours Watched</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.statBlock}>
            <ThemedText type="smallBold">{stats.totalItems > 0 ? Math.round((stats.byStatus['completed'] || 0) / stats.totalItems * 100) : 0}%</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Completed</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.statBlock}>
            <ThemedText type="smallBold">{stats.byStatus['watching'] || 0}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">Watching</ThemedText>
          </ThemedView>
        </ThemedView>

        {streaks && (
          <ThemedView style={styles.streakSection}>
            <ThemedView type="backgroundElement" style={styles.streakCard}>
              <ThemedText type="subtitle" style={styles.streakNumber}>{streaks.currentStreak}</ThemedText>
              <ThemedText themeColor="textSecondary">Day Streak</ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.streakCard}>
              <ThemedText type="subtitle" style={styles.streakNumber}>{streaks.longestStreak}</ThemedText>
              <ThemedText themeColor="textSecondary">Longest Streak</ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {genres.length > 0 && (
          <BarChart
            title="Genre Distribution"
            data={genres.slice(0, 10).map((g) => ({ label: g.genre, value: g.count }))}
            height={180}
            barColor={theme.primary}
          />
        )}

        {monthly.length > 0 && (
          <BarChart
            title="Monthly Activity"
            data={monthly.slice(-6).map((m) => ({ label: m.month.slice(5), value: m.count }))}
            height={140}
            barColor={theme.success || '#34D399'}
          />
        )}

        {ratingDist.length > 0 && (
          <BarChart
            title="Rating Distribution"
            data={ratingDist.map((r) => ({ label: String(r.rating), value: r.count }))}
            height={140}
            barColor={theme.warning || '#F59E0B'}
          />
        )}
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { gap: Spacing.half, paddingVertical: Spacing.three },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  summaryCard: { flex: 1, minWidth: '40%', borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center', gap: Spacing.half },
  cardValue: { fontSize: 32 },
  statsRow: { flexDirection: 'row', gap: Spacing.three },
  statBlock: { flex: 1, borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center', gap: Spacing.half },
  streakSection: { flexDirection: 'row', gap: Spacing.three },
  streakCard: { flex: 1, borderRadius: Spacing.four, padding: Spacing.four, alignItems: 'center', gap: Spacing.half },
  streakNumber: { fontSize: 28 },
});

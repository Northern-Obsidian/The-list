import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getTimelineHeatmapData, getStreakData } from '@/services/stats-engine';
import { formatDate } from '@/utils/format';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const heatmapData = useMemo(() => getTimelineHeatmapData(selectedYear), [selectedYear]);
  const streakData = useMemo(() => getStreakData(), []);

  const heatmapMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of heatmapData) {
      map[d.date] = d.count;
    }
    return map;
  }, [heatmapData]);

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);

    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push({ date: '', count: 0 });
    }

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      currentWeek.push({ date: dateStr, count: heatmapMap[dateStr] || 0 });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0 });
      }
      result.push(currentWeek);
    }

    return result;
  }, [heatmapMap, selectedYear]);

  const getHeatColor = (count: number) => {
    if (count === 0) return theme.backgroundElement;
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return theme.primaryDark;
    if (intensity < 0.5) return theme.primary;
    if (intensity < 0.75) return theme.primaryLight;
    return theme.success;
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const totalEvents = heatmapData.reduce((sum, d) => sum + d.count, 0);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: insets.bottom + BottomTabInset + Spacing.three }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}>
            <Icon name="arrow-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Timeline</ThemedText>
          <View style={styles.spacer} />
        </ThemedView>

        <View style={styles.streakRow}>
          <ThemedView type="backgroundElement" style={styles.streakCard}>
            <ThemedText style={[styles.streakValue, { color: theme.text }]}>{streakData.currentStreak}</ThemedText>
            <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>Day Streak</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.streakCard}>
            <ThemedText style={[styles.streakValue, { color: theme.text }]}>{streakData.longestStreak}</ThemedText>
            <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>Best Streak</ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.streakCard}>
            <ThemedText style={[styles.streakValue, { color: theme.text }]}>{totalEvents}</ThemedText>
            <ThemedText style={[styles.streakLabel, { color: theme.textSecondary }]}>Events</ThemedText>
          </ThemedView>
        </View>

        <View style={styles.yearRow}>
          {years.map((y) => (
            <Pressable
              key={y}
              style={({ pressed }) => [
                styles.yearPill,
                {
                  backgroundColor: selectedYear === y ? theme.primary : theme.backgroundElement,
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setSelectedYear(y)}
            >
              <ThemedText
                style={[
                  styles.yearText,
                  { color: selectedYear === y ? '#FFF' : theme.textSecondary },
                ]}
              >
                {y}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedView type="backgroundElement" style={styles.heatmapSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.heatmap}>
              <View style={styles.heatmapHeader}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <ThemedText key={m} style={[styles.monthLabel, { color: theme.textSecondary }]}>
                    {m}
                  </ThemedText>
                ))}
              </View>
              <View style={styles.heatmapBody}>
                {weeks.map((week, wi) => (
                  <View key={wi} style={styles.weekColumn}>
                    {week.map((day, di) => {
                      if (!day.date) return <View key={`empty-${di}`} style={styles.heatCell} />;
                      return (
                        <View
                          key={day.date}
                          style={[styles.heatCell, { backgroundColor: getHeatColor(day.count) }]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={styles.heatmapLegend}>
            <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>Less</ThemedText>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <View key={v} style={[styles.legendCell, { backgroundColor: getHeatColor(v * maxCount) }]} />
            ))}
            <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>More</ThemedText>
          </View>
        </ThemedView>

        {streakData.lastWatchDate && (
          <ThemedText style={[styles.lastWatch, { color: theme.textSecondary }]}>
            Last activity: {formatDate(streakData.lastWatchDate)}
          </ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  spacer: { width: 40 },
  streakRow: { flexDirection: 'row', gap: Spacing.three },
  streakCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: Spacing.half },
  streakValue: { fontSize: 28, fontWeight: '700' },
  streakLabel: { fontSize: 12 },
  yearRow: { flexDirection: 'row', gap: Spacing.two },
  yearPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  yearText: { fontSize: 12, fontWeight: '600' },
  heatmapSection: { borderRadius: 16, padding: 16, gap: Spacing.three },
  heatmap: { gap: Spacing.two },
  heatmapHeader: { flexDirection: 'row', gap: 4 },
  monthLabel: { fontSize: 10, width: 14 },
  heatmapBody: { flexDirection: 'row', gap: 3 },
  weekColumn: { gap: 3 },
  heatCell: { width: 12, height: 12, borderRadius: 2 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.half, justifyContent: 'flex-end' },
  legendCell: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 10 },
  lastWatch: { textAlign: 'center' },
});

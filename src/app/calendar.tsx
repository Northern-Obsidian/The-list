import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { eq } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/ui/modal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHaptics } from '@/hooks/use-haptics';
import { getMonthlyActivity } from '@/services/stats-engine';
import { formatDate } from '@/utils/format';
import { getDatabase } from '@/db';
import { watchHistory, media } from '@/db/schema';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const MOOD_OPTIONS = ['😊 Happy', '😢 Sad', '😴 Tired', '🤩 Excited', '🧐 Thoughtful', '😌 Relaxed', '🎉 Celebratory', '😐 Neutral'];
const PLATFORM_OPTIONS = ['Netflix', 'Hulu', 'Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Crunchyroll', 'YouTube', 'Cinema', 'DVD/Blu-ray', 'Other'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayHistory, setDayHistory] = useState<{ id: string; mediaTitle: string; watchedAt: string; durationMinutes: number | null; note: string | null; watchedWith: string | null; mood: string | null; platform: string | null; device: string | null }[]>([]);
  const [showCapsuleModal, setShowCapsuleModal] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [capsuleMood, setCapsuleMood] = useState('');
  const [capsulePlatform, setCapsulePlatform] = useState('');
  const [capsuleDevice, setCapsuleDevice] = useState('');
  const [capsuleWatchedWith, setCapsuleWatchedWith] = useState('');
  const [capsuleNote, setCapsuleNote] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthlyActivity = useMemo(() => getMonthlyActivity(12), []);
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of monthlyActivity) {
      map[a.month] = a.count;
    }
    return map;
  }, [monthlyActivity]);

  const activeDays = useMemo(() => {
    const set = new Set<number>();
    const { db } = getDatabase();
    const allHistory = db.select().from(watchHistory).all();
    for (const entry of allHistory) {
      const d = new Date(entry.watchedAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
      }
    }
    return set;
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const loadDayHistory = useCallback((dateStr: string) => {
    const { db } = getDatabase();
    const allMedia = db.select().from(media).all();
    const mediaMap = new Map(allMedia.map((m) => [m.id, m.title]));
    const rows = db.select().from(watchHistory).where(eq(watchHistory.watchedAt, dateStr)).all();
    setDayHistory(
      rows.map((r) => ({
        id: r.id,
        mediaTitle: mediaMap.get(r.mediaId) || 'Unknown',
        watchedAt: r.watchedAt,
        durationMinutes: r.durationMinutes,
        note: r.note,
        watchedWith: r.watchedWith,
        mood: r.mood,
        platform: r.platform,
        device: r.device,
      })),
    );
  }, []);

  const navigateMonth = useCallback((delta: number) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDate(null);
  }, []);

  const isToday = useCallback((day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  }, [year, month]);

  const onDayPress = useCallback((dateStr: string) => {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
    loadDayHistory(dateStr);
  }, [loadDayHistory]);

  const openCapsule = useCallback((entry: typeof dayHistory[0] | null) => {
    if (entry) {
      setEditingHistoryId(entry.id);
      setCapsuleMood(entry.mood || '');
      setCapsulePlatform(entry.platform || '');
      setCapsuleDevice(entry.device || '');
      setCapsuleWatchedWith(entry.watchedWith || '');
      setCapsuleNote(entry.note || '');
    } else {
      setEditingHistoryId(null);
      setCapsuleMood('');
      setCapsulePlatform('');
      setCapsuleDevice('');
      setCapsuleWatchedWith('');
      setCapsuleNote('');
    }
    setShowCapsuleModal(true);
  }, []);

  const saveCapsule = useCallback(() => {
    const { db } = getDatabase();
    if (editingHistoryId) {
      db.update(watchHistory)
        .set({
          mood: capsuleMood || null,
          platform: capsulePlatform || null,
          device: capsuleDevice || null,
          watchedWith: capsuleWatchedWith || null,
          note: capsuleNote || null,
        })
        .where(eq(watchHistory.id, editingHistoryId))
        .run();
    }
    setShowCapsuleModal(false);
    if (selectedDate) loadDayHistory(selectedDate);
  }, [editingHistoryId, capsuleMood, capsulePlatform, capsuleDevice, capsuleWatchedWith, capsuleNote, selectedDate, loadDayHistory]);

  const deleteEntry = useCallback((entryId: string) => {
    Alert.alert('Delete Entry', 'Remove this watch history entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const { db } = getDatabase();
          db.delete(watchHistory).where(eq(watchHistory.id, entryId)).run();
          if (selectedDate) loadDayHistory(selectedDate);
        },
      },
    ]);
  }, [selectedDate, loadDayHistory]);

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const currentMonthActivity = activityMap[monthKey] || 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: insets.bottom + BottomTabInset + Spacing.three }}
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
          >
            <Icon name="arrow-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Calendar</ThemedText>
          <View style={styles.headerSpacer} />
        </ThemedView>

        <ThemedView style={styles.navigation}>
          <Pressable
            onPress={() => { haptics.light(); navigateMonth(-1); }}
            style={[styles.navArrow, { backgroundColor: theme.backgroundElement }]}
          >
            <Icon name="chevron-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.monthTitle, { color: theme.text }]}>
            {MONTHS[month]} {year}
          </ThemedText>
          <Pressable
            onPress={() => { haptics.light(); navigateMonth(1); }}
            style={[styles.navArrow, { backgroundColor: theme.backgroundElement }]}
          >
            <Icon name="chevron-right" size={20} color={theme.text} />
          </Pressable>
        </ThemedView>

        <ThemedView style={[styles.calendarContainer, { backgroundColor: theme.backgroundElement }]}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d) => (
              <ThemedText key={d} style={[styles.weekday, { color: theme.textSecondary }]}>
                {d}
              </ThemedText>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, i) => {
              if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;

              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isTodayDate = isToday(day);
              const hasActivity = activeDays.has(day);

              return (
                <Pressable
                  key={dateStr}
                  style={[
                    styles.dayCell,
                    styles.dayInner,
                    isSelected && { backgroundColor: theme.primary },
                    isTodayDate && !isSelected && { borderColor: theme.primary, borderWidth: 1 },
                  ]}
                  onPress={() => { haptics.light(); onDayPress(dateStr); }}
                >
                  <ThemedText
                    style={[
                      styles.dayText,
                      { color: theme.text },
                      isSelected && { color: '#FFFFFF' },
                      isTodayDate && !isSelected && { color: theme.primary },
                    ]}
                  >
                    {day}
                  </ThemedText>
                  {hasActivity && !isSelected && (
                    <View style={[styles.activityDot, { backgroundColor: theme.primary }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        {selectedDate && (
          <ThemedView style={[styles.selectedDay, { backgroundColor: theme.backgroundElement }]}>
            <ThemedView style={styles.selectedDayHeader}>
              <ThemedText style={[styles.selectedDayTitle, { color: theme.text }]}>{formatDate(selectedDate)}</ThemedText>
              <ThemedText style={[styles.selectedDayCount, { color: theme.textSecondary }]}>
                {dayHistory.length} entr{dayHistory.length !== 1 ? 'ies' : 'y'}
              </ThemedText>
            </ThemedView>
            {dayHistory.length === 0 ? (
              <ThemedText style={[styles.noHistory, { color: theme.textSecondary }]}>
                No watch history for this day
              </ThemedText>
            ) : (
              <View style={styles.historyList}>
                {dayHistory.map((entry) => (
                  <Pressable
                    key={entry.id}
                    style={({ pressed }) => [
                      styles.historyItem,
                      { backgroundColor: theme.background },
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => { haptics.light(); openCapsule(entry); }}
                  >
                    <View style={styles.historyItemContent}>
                      <ThemedText style={[styles.historyItemTitle, { color: theme.text }]}>{entry.mediaTitle}</ThemedText>
                      <ThemedText style={[styles.historyItemMeta, { color: theme.textSecondary }]}>
                        {entry.mood || ''} {entry.platform ? `· ${entry.platform}` : ''} {entry.durationMinutes ? `· ${entry.durationMinutes}m` : ''}
                      </ThemedText>
                    </View>
                    <Pressable
                      style={({ pressed }) => [pressed && { opacity: 0.5 }]}
                      onPress={() => deleteEntry(entry.id)}
                    >
                      <ThemedText style={{ color: theme.error, fontSize: 12 }}>Delete</ThemedText>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            )}
          </ThemedView>
        )}

        <Modal visible={showCapsuleModal} onClose={() => setShowCapsuleModal(false)} title="Memory Capsule">
          <ThemedView style={styles.capsuleContent}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.capsuleLabel}>Mood</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capsuleChips}>
              {MOOD_OPTIONS.map((m) => (
                <Pressable
                  key={m}
                  style={({ pressed }) => [
                    styles.capsuleChip,
                    { backgroundColor: capsuleMood === m ? theme.primary : theme.backgroundElement },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => { haptics.light(); setCapsuleMood(capsuleMood === m ? '' : m); }}
                >
                  <ThemedText type="small" style={capsuleMood === m ? { color: '#FFFFFF' } : undefined}>{m}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <ThemedText type="small" themeColor="textSecondary" style={styles.capsuleLabel}>Platform</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capsuleChips}>
              {PLATFORM_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  style={({ pressed }) => [
                    styles.capsuleChip,
                    { backgroundColor: capsulePlatform === p ? theme.primary : theme.backgroundElement },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => { haptics.light(); setCapsulePlatform(capsulePlatform === p ? '' : p); }}
                >
                  <ThemedText type="small" style={capsulePlatform === p ? { color: '#FFFFFF' } : undefined}>{p}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <ThemedText type="small" themeColor="textSecondary" style={styles.capsuleLabel}>Device</ThemedText>
            <TextInput
              style={[styles.capsuleInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
              value={capsuleDevice}
              onChangeText={setCapsuleDevice}
              placeholder="e.g. iPhone, TV, Laptop"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" themeColor="textSecondary" style={styles.capsuleLabel}>Watched With</ThemedText>
            <TextInput
              style={[styles.capsuleInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
              value={capsuleWatchedWith}
              onChangeText={setCapsuleWatchedWith}
              placeholder="e.g. John, Family"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" themeColor="textSecondary" style={styles.capsuleLabel}>Note</ThemedText>
            <TextInput
              style={[styles.capsuleInput, styles.capsuleInputMultiline, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
              value={capsuleNote}
              onChangeText={setCapsuleNote}
              placeholder="How was it?"
              placeholderTextColor={theme.textSecondary}
              multiline
            />

            <View style={styles.capsuleActions}>
              <Button variant="secondary" onPress={() => setShowCapsuleModal(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button onPress={saveCapsule} style={{ flex: 1 }}>
                Save
              </Button>
            </View>
          </ThemedView>
        </Modal>

        <ThemedView style={[styles.summarySection, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>Monthly Summary</ThemedText>
          {monthlyActivity.slice(-6).reverse().map((m) => (
            <View key={m.month} style={styles.monthRow}>
              <ThemedText style={[styles.monthLabel, { color: theme.text }]}>{m.month}</ThemedText>
              <View style={[styles.miniBar, { backgroundColor: theme.background }]}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      width: `${Math.min((m.count / Math.max(...monthlyActivity.map((x) => x.count), 1)) * 100, 100)}%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.monthCount, { color: theme.textSecondary }]}>{m.count}</ThemedText>
            </View>
          ))}
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40, height: 40 },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navArrow: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  monthTitle: { fontSize: 20, fontWeight: '600' },
  calendarContainer: { borderRadius: 16, padding: 16, gap: 8 },
  weekdayRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayInner: { borderRadius: 8 },
  dayText: { fontSize: 14 },
  activityDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  selectedDay: { borderRadius: 16, padding: 16, gap: 8 },
  selectedDayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedDayTitle: { fontSize: 14, fontWeight: '600' },
  selectedDayCount: { fontSize: 12 },
  noHistory: { paddingVertical: 12, textAlign: 'center' },
  historyList: { gap: 8 },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  historyItemContent: { flex: 1, gap: 4 },
  historyItemTitle: { fontSize: 14, fontWeight: '600' },
  historyItemMeta: { fontSize: 12 },
  capsuleContent: { gap: Spacing.three },
  capsuleLabel: { marginLeft: Spacing.one },
  capsuleChips: { marginHorizontal: -Spacing.one },
  capsuleChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 20, marginRight: Spacing.two },
  capsuleInput: { borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.three, fontSize: 16 },
  capsuleInputMultiline: { height: 80, textAlignVertical: 'top' },
  capsuleActions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
  summarySection: { borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monthLabel: { width: 60, fontSize: 13 },
  miniBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 4 },
  monthCount: { fontSize: 13, width: 24, textAlign: 'right' },
});

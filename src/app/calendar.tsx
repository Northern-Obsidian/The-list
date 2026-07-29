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
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Back</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Calendar</ThemedText>
          <View style={{ width: 50 }} />
        </ThemedView>

        <ThemedView style={styles.navigation}>
          <Pressable onPress={() => navigateMonth(-1)} style={styles.navButton}>
            <Icon name="chevron.left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="subtitle" style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </ThemedText>
          <Pressable onPress={() => navigateMonth(1)} style={styles.navButton}>
            <Icon name="chevron.right" size={20} color={theme.text} />
          </Pressable>
        </ThemedView>

        <ThemedText type="small" themeColor="textSecondary" style={styles.activityLabel}>
          {currentMonthActivity} watch event{currentMonthActivity !== 1 ? 's' : ''} this month
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.calendarGrid}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d) => (
              <ThemedText key={d} type="small" themeColor="textSecondary" style={styles.weekday}>
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

              return (
                <Pressable
                  key={dateStr}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: theme.primary },
                    isTodayDate && !isSelected && { borderColor: theme.primary, borderWidth: 1 },
                  ]}
                  onPress={() => onDayPress(dateStr)}
                >
                  <ThemedText
                    type="small"
                    style={[
                      isSelected && { color: '#FFF' },
                      isTodayDate && !isSelected && { color: theme.primary },
                    ]}
                  >
                    {day}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        {selectedDate && (
          <ThemedView type="backgroundElement" style={styles.selectedDay}>
            <ThemedView style={styles.selectedDayHeader}>
              <ThemedText type="smallBold">{formatDate(selectedDate)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {dayHistory.length} entr{dayHistory.length !== 1 ? 'ies' : 'y'}
              </ThemedText>
            </ThemedView>
            {dayHistory.length === 0 ? (
              <ThemedText themeColor="textSecondary" type="small" style={styles.noHistory}>
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
                    onPress={() => openCapsule(entry)}
                  >
                    <ThemedView style={styles.historyItemContent}>
                      <ThemedText type="smallBold">{entry.mediaTitle}</ThemedText>
                      <ThemedView style={styles.historyMeta}>
                        <ThemedText type="small" themeColor="textSecondary">
                          {entry.mood || ''} {entry.platform ? `· ${entry.platform}` : ''} {entry.durationMinutes ? `· ${entry.durationMinutes}m` : ''}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
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
                  onPress={() => setCapsuleMood(capsuleMood === m ? '' : m)}
                >
                  <ThemedText type="small" style={capsuleMood === m ? { color: '#FFF' } : undefined}>{m}</ThemedText>
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
                  onPress={() => setCapsulePlatform(capsulePlatform === p ? '' : p)}
                >
                  <ThemedText type="small" style={capsulePlatform === p ? { color: '#FFF' } : undefined}>{p}</ThemedText>
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

        <ThemedView type="backgroundElement" style={styles.summarySection}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Monthly Summary</ThemedText>
          {monthlyActivity.slice(-6).reverse().map((m) => (
            <View key={m.month} style={styles.monthRow}>
              <ThemedText type="small" style={styles.monthLabel}>{m.month}</ThemedText>
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
              <ThemedText type="small" themeColor="textSecondary">{m.count}</ThemedText>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { padding: Spacing.three },
  monthTitle: { fontSize: 24 },
  activityLabel: { textAlign: 'center' },
  calendarGrid: { borderRadius: Spacing.four, padding: Spacing.three, gap: Spacing.two },
  weekdayRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: Spacing.two },
  selectedDay: { padding: Spacing.four, borderRadius: Spacing.four, alignItems: 'center', gap: Spacing.one },
  summarySection: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  selectedDayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  noHistory: { paddingVertical: Spacing.three },
  historyList: { width: '100%', gap: Spacing.two },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.three, borderRadius: Spacing.three },
  historyItemContent: { flex: 1, gap: Spacing.half },
  historyMeta: { flexDirection: 'row', gap: Spacing.half },
  capsuleContent: { gap: Spacing.three },
  capsuleLabel: { marginLeft: Spacing.one },
  capsuleChips: { marginHorizontal: -Spacing.one },
  capsuleChip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 20, marginRight: Spacing.two },
  capsuleInput: { borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.three, fontSize: 16 },
  capsuleInputMultiline: { height: 80, textAlignVertical: 'top' },
  capsuleActions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  monthLabel: { width: 60 },
  miniBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 4 },
});

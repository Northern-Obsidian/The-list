import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { eq, desc } from 'drizzle-orm';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { watchHistory, media } from '@/db/schema';
import { generateId } from '@/utils/generate-id';
import { formatDate } from '@/utils/format';

const MOOD_OPTIONS = ['😊 Happy', '😢 Sad', '😴 Tired', '🤩 Excited', '🧐 Thoughtful', '😌 Relaxed', '😐 Neutral'];
const PLATFORM_OPTIONS = ['Netflix', 'Hulu', 'Prime Video', 'Disney+', 'HBO Max', 'Apple TV+', 'Crunchyroll', 'YouTube', 'Cinema', 'DVD/Blu-ray', 'Other'];

type HistoryEntry = {
  id: string;
  mediaId: string;
  mediaTitle: string;
  watchedAt: string;
  durationMinutes: number | null;
  note: string | null;
  watchedWith: string | null;
  mood: string | null;
  platform: string | null;
  device: string | null;
};

export default function WatchHistoryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const [editMood, setEditMood] = useState('');
  const [editPlatform, setEditPlatform] = useState('');
  const [editDevice, setEditDevice] = useState('');
  const [editWatchedWith, setEditWatchedWith] = useState('');
  const [editNote, setEditNote] = useState('');

  const loadHistory = useCallback(() => {
    const { db } = getDatabase();
    const allMedia = db.select().from(media).all();
    const mediaMap = new Map(allMedia.map((m) => [m.id, m.title]));
    const rows = db.select().from(watchHistory).orderBy(desc(watchHistory.watchedAt)).limit(100).all();
    setEntries(
      rows.map((r) => ({
        id: r.id,
        mediaId: r.mediaId,
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

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const openEdit = useCallback((entry: HistoryEntry) => {
    setEditingEntry(entry);
    setEditMood(entry.mood || '');
    setEditPlatform(entry.platform || '');
    setEditDevice(entry.device || '');
    setEditWatchedWith(entry.watchedWith || '');
    setEditNote(entry.note || '');
    setShowEditModal(true);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingEntry) return;
    const { db } = getDatabase();
    db.update(watchHistory)
      .set({
        mood: editMood || null,
        platform: editPlatform || null,
        device: editDevice || null,
        watchedWith: editWatchedWith || null,
        note: editNote || null,
      })
      .where(eq(watchHistory.id, editingEntry.id))
      .run();
    setShowEditModal(false);
    setEditingEntry(null);
    loadHistory();
  }, [editingEntry, editMood, editPlatform, editDevice, editWatchedWith, editNote, loadHistory]);

  const handleDelete = useCallback((entry: HistoryEntry) => {
    Alert.alert('Delete Entry', `Remove record of watching "${entry.mediaTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          const { db } = getDatabase();
          db.delete(watchHistory).where(eq(watchHistory.id, entry.id)).run();
          loadHistory();
        },
      },
    ]);
  }, [loadHistory]);

  const handleQuickAdd = useCallback(() => {
    const { db } = getDatabase();
    const allMedia = db.select().from(media).all();
    if (allMedia.length === 0) {
      Alert.alert('No Media', 'Add some media to your library first.');
      return;
    }
    const lastEntry = allMedia[allMedia.length - 1];
    db.insert(watchHistory)
      .values({
        id: generateId(),
        mediaId: lastEntry.id,
        profileId: getActiveProfileId(),
        watchedAt: new Date().toISOString().split('T')[0],
      })
      .run();
    loadHistory();
  }, [loadHistory]);

  const renderItem = useCallback(
    ({ item }: { item: HistoryEntry }) => (
      <Pressable
        style={({ pressed }) => [
          styles.entryCard,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push(`/media/${item.mediaId}`)}
      >
        <ThemedView style={styles.entryInfo}>
          <ThemedText type="smallBold">{item.mediaTitle}</ThemedText>
          <ThemedView style={styles.entryMeta}>
            <ThemedText type="small" themeColor="textSecondary">{formatDate(item.watchedAt)}</ThemedText>
            {item.durationMinutes && (
              <ThemedText type="small" themeColor="textSecondary"> · {item.durationMinutes}m</ThemedText>
            )}
          </ThemedView>
          {(item.mood || item.platform) && (
            <ThemedText type="small" themeColor="textSecondary">
              {item.mood || ''}{item.platform ? ` · ${item.platform}` : ''}
            </ThemedText>
          )}
        </ThemedView>
        <Pressable
          style={({ pressed }) => [styles.entryAction, pressed && { opacity: 0.5 }]}
          onPress={() => openEdit(item)}
        >
          <ThemedText type="link">Edit</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.entryAction, pressed && { opacity: 0.5 }]}
          onPress={() => handleDelete(item)}
        >
          <ThemedText style={{ color: theme.error, fontSize: 14 }}>✕</ThemedText>
        </Pressable>
      </Pressable>
    ),
    [theme, openEdit, handleDelete],
  );

  return (
    <>
      <FlatList
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + BottomTabInset + Spacing.three }]}
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <ThemedView style={styles.header}>
              <Pressable onPress={() => router.back()}>
                <ThemedText type="link">Back</ThemedText>
              </Pressable>
              <ThemedText type="subtitle">Watch History</ThemedText>
              <Pressable onPress={handleQuickAdd}>
                <ThemedText type="link">Quick Add</ThemedText>
              </Pressable>
            </ThemedView>
            <ThemedText type="small" themeColor="textSecondary" style={styles.count}>
              {entries.length} recent entr{entries.length !== 1 ? 'ies' : 'y'}
            </ThemedText>
          </ThemedView>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyIcon}>📋</ThemedText>
            <ThemedText themeColor="textSecondary">No watch history yet</ThemedText>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Entry">
        <ThemedView style={styles.modalContent}>
          {editingEntry && (
            <ThemedText type="smallBold" style={styles.modalMediaTitle}>{editingEntry.mediaTitle}</ThemedText>
          )}

          <ThemedText type="small" themeColor="textSecondary">Mood</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MOOD_OPTIONS.map((m) => (
              <Pressable
                key={m}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: editMood === m ? theme.primary : theme.backgroundElement },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setEditMood(editMood === m ? '' : m)}
              >
                <ThemedText type="small" style={editMood === m ? { color: '#FFF' } : undefined}>{m}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <ThemedText type="small" themeColor="textSecondary">Platform</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PLATFORM_OPTIONS.map((p) => (
              <Pressable
                key={p}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: editPlatform === p ? theme.primary : theme.backgroundElement },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setEditPlatform(editPlatform === p ? '' : p)}
              >
                <ThemedText type="small" style={editPlatform === p ? { color: '#FFF' } : undefined}>{p}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <ThemedText type="small" themeColor="textSecondary">Device</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
            value={editDevice}
            onChangeText={setEditDevice}
            placeholder="e.g. iPhone"
            placeholderTextColor={theme.textSecondary}
          />

          <ThemedText type="small" themeColor="textSecondary">Watched With</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
            value={editWatchedWith}
            onChangeText={setEditWatchedWith}
            placeholder="e.g. John"
            placeholderTextColor={theme.textSecondary}
          />

          <ThemedText type="small" themeColor="textSecondary">Note</ThemedText>
          <TextInput
            style={[styles.input, styles.inputMultiline, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border || 'transparent' }]}
            value={editNote}
            onChangeText={setEditNote}
            placeholder="How was it?"
            placeholderTextColor={theme.textSecondary}
            multiline
          />

          <View style={styles.modalActions}>
            <Button variant="secondary" onPress={() => setShowEditModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onPress={saveEdit} style={{ flex: 1 }}>Save</Button>
          </View>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.three, paddingHorizontal: Spacing.four },
  count: { paddingHorizontal: Spacing.four, marginBottom: Spacing.two },
  emptyState: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.six },
  emptyIcon: { fontSize: 64 },
  entryCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.four,
    borderRadius: Spacing.three, gap: Spacing.three,
    marginHorizontal: Spacing.four, marginBottom: Spacing.two,
  },
  entryInfo: { flex: 1, gap: Spacing.half },
  entryMeta: { flexDirection: 'row', gap: Spacing.half },
  entryAction: { padding: Spacing.one, marginLeft: Spacing.one },
  modalContent: { gap: Spacing.three },
  modalMediaTitle: { marginBottom: Spacing.one },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 20, marginRight: Spacing.two },
  input: { borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.three, fontSize: 16 },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
});

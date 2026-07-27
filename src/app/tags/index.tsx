import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDatabase, getActiveProfileId } from '@/db';
import { tags, mediaTags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getTagCounts } from '@/db/queries';
import { generateId } from '@/utils/generate-id';

const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#22C55E', '#06B6D4',
  '#3C9FFE', '#6366F1', '#A78BFA', '#EC4899', '#888888',
];

export default function TagsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [tagList, setTagList] = useState<(typeof tags.$inferSelect & { count: number })[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTag, setEditingTag] = useState<typeof tags.$inferSelect | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const loadTags = useCallback(() => {
    setTagList(getTagCounts());
  }, []);

  useEffect(loadTags, [loadTags]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { db } = getDatabase();
      db.insert(tags)
        .values({ id: generateId(), profileId: getActiveProfileId(), name: newName.trim(), color: newColor })
        .run();
      setShowCreate(false);
      setNewName('');
      setNewColor(TAG_COLORS[0]);
      loadTags();
    } catch {
      Alert.alert('Error', 'Failed to create tag');
    } finally {
      setSaving(false);
    }
  }, [newName, newColor, loadTags]);

  const handleRename = useCallback(async () => {
    if (!editingTag || !newName.trim()) return;
    setSaving(true);
    try {
      const { db } = getDatabase();
      db.update(tags)
        .set({ name: newName.trim(), color: newColor })
        .where(eq(tags.id, editingTag.id))
        .run();
      setEditingTag(null);
      setNewName('');
      loadTags();
    } catch {
      Alert.alert('Error', 'Failed to update tag');
    } finally {
      setSaving(false);
    }
  }, [editingTag, newName, newColor, loadTags]);

  const handleDelete = useCallback((tag: typeof tags.$inferSelect) => {
    Alert.alert('Delete Tag', `Delete "${tag.name}"? Items won't be affected.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const { db } = getDatabase();
          db.delete(mediaTags).where(eq(mediaTags.tagId, tag.id)).run();
          db.delete(tags).where(eq(tags.id, tag.id)).run();
          loadTags();
        },
      },
    ]);
  }, [loadTags]);

  const openEdit = useCallback((tag: typeof tags.$inferSelect) => {
    setEditingTag(tag);
    setNewName(tag.name);
    setNewColor(tag.color);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: typeof tagList[0] }) => (
      <Pressable
        style={({ pressed }) => [
          styles.tagCard,
          { backgroundColor: theme.backgroundElement },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => router.push(`/tags/${item.id}`)}
      >
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        <ThemedView style={styles.tagInfo}>
          <ThemedText type="smallBold">{item.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {item.count} item{item.count !== 1 ? 's' : ''}
          </ThemedText>
        </ThemedView>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.5 }]}
          onPress={() => openEdit(item)}
        >
          <ThemedText type="link">Edit</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.5 }]}
          onPress={() => handleDelete(item)}
        >
          <ThemedText style={{ color: theme.error }}>Delete</ThemedText>
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
        data={tagList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <ThemedView style={styles.header}>
              <Pressable onPress={() => router.back()}>
                <ThemedText type="link">Back</ThemedText>
              </Pressable>
              <ThemedText type="subtitle">Tags</ThemedText>
              <Pressable onPress={() => setShowCreate(true)}>
                <ThemedText type="link">New</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle" style={styles.emptyIcon}>🏷️</ThemedText>
            <ThemedText themeColor="textSecondary">
              No tags yet. Create tags to organize your library.
            </ThemedText>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showCreate} onClose={() => setShowCreate(false)} title="Create Tag">
        <ThemedView style={styles.modalContent}>
          <Input
            label="Tag Name"
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Favorites, Watch Later"
            autoFocus
          />
          <ThemedText type="small" themeColor="textSecondary" style={styles.colorLabel}>
            Color
          </ThemedText>
          <View style={styles.colorRow}>
            {TAG_COLORS.map((c) => (
              <Pressable
                key={c}
                style={({ pressed }) => [
                  styles.colorSwatch,
                  { backgroundColor: c },
                  newColor === c && styles.colorSwatchSelected,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setNewColor(c)}
              />
            ))}
          </View>
          <ThemedView style={styles.modalActions}>
            <Button variant="secondary" onPress={() => setShowCreate(false)} style={styles.modalButton}>
              Cancel
            </Button>
            <Button onPress={handleCreate} disabled={saving || !newName.trim()} style={styles.modalButton}>
              {saving ? 'Creating...' : 'Create'}
            </Button>
          </ThemedView>
        </ThemedView>
      </Modal>

      {editingTag && (
        <Modal visible={!!editingTag} onClose={() => setEditingTag(null)} title="Edit Tag">
          <ThemedView style={styles.modalContent}>
            <Input
              label="Tag Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="Tag name"
              autoFocus
            />
            <ThemedText type="small" themeColor="textSecondary" style={styles.colorLabel}>
              Color
            </ThemedText>
            <View style={styles.colorRow}>
              {TAG_COLORS.map((c) => (
                <Pressable
                  key={c}
                  style={({ pressed }) => [
                    styles.colorSwatch,
                    { backgroundColor: c },
                    newColor === c && styles.colorSwatchSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setNewColor(c)}
                />
              ))}
            </View>
            <ThemedView style={styles.modalActions}>
              <Button variant="secondary" onPress={() => setEditingTag(null)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button onPress={handleRename} disabled={saving || !newName.trim()} style={styles.modalButton}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyState: {
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  emptyIcon: { fontSize: 64 },
  tagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  tagInfo: { flex: 1, gap: Spacing.half },
  actionButton: { padding: Spacing.one, marginLeft: Spacing.two },
  modalContent: { gap: Spacing.four, padding: Spacing.one },
  colorLabel: { marginLeft: Spacing.one },
  colorRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: { borderColor: '#FFFFFF' },
  modalActions: { flexDirection: 'row', gap: Spacing.three },
  modalButton: { flex: 1 },
});

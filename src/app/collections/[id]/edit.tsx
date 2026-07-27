import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';

import { CollectionForm } from '@/components/collections/collection-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScreenLoader } from '@/components/ui/screen-loader';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getDatabase } from '@/db';
import { collections } from '@/db/schema';

export default function EditCollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [initialData, setInitialData] = useState<{
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isSmart: boolean;
    smartRules?: import('@/types/collections').SmartRules;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    const { db } = getDatabase();
    const col = db.select().from(collections).where(eq(collections.id, id)).get();
    if (col) {
      setInitialData({
        id: col.id,
        name: col.name,
        description: col.description || undefined,
        color: col.color || undefined,
        icon: col.icon || undefined,
        isSmart: col.isSmart || false,
        smartRules: col.smartRules ? JSON.parse(col.smartRules) : undefined,
      });
    }
  }, [id]);

  if (!initialData && id) {
    return <ScreenLoader />;
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ThemedText type="link">Cancel</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">Edit Collection</ThemedText>
        <ThemedView style={{ width: 50 }} />
      </ThemedView>
      <CollectionForm
        initialData={initialData || undefined}
        onSave={() => router.back()}
        onCancel={() => router.back()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
});

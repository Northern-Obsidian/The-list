import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { importFromJson, importFromCsv } from '@/services/import-service';

export default function ImportScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [jsonInput, setJsonInput] = useState('');
  const [csvInput, setCsvInput] = useState('');
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  const handleImportJson = useCallback(() => {
    if (!jsonInput.trim()) {
      Alert.alert('Error', 'Please paste JSON data first');
      return;
    }
    const importResult = importFromJson(jsonInput);
    setResult(importResult);
    if (importResult.success) {
      Alert.alert('Import Complete', `Imported ${importResult.imported} items`);
    } else {
      Alert.alert('Import Issues', `${importResult.imported} imported, ${importResult.skipped} skipped`);
    }
  }, [jsonInput]);

  const handleImportCsv = useCallback(() => {
    if (!csvInput.trim()) {
      Alert.alert('Error', 'Please paste CSV data first');
      return;
    }
    const importResult = importFromCsv(csvInput);
    setResult(importResult);
    if (importResult.success) {
      Alert.alert('Import Complete', `Imported ${importResult.imported} items`);
    } else {
      Alert.alert('Import Issues', `${importResult.imported} imported, ${importResult.skipped} skipped`);
    }
  }, [csvInput]);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Done</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Import Data</ThemedText>
          <View style={{ width: 50 }} />
        </ThemedView>

        <ThemedText themeColor="textSecondary">
          Import your media library by pasting JSON or CSV data below.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Import from JSON</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Format: {"{\"items\": [{\"title\": \"...\", \"mediaType\": \"movie\", \"status\": \"completed\"}]}"}
          </ThemedText>
          <Input
            label="Paste JSON data"
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder='{"items": [{"title": "Inception", "mediaType": "movie"}]}'
            multiline
          />
          <Button onPress={handleImportJson}>Import JSON</Button>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Import from CSV</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Format: title,mediaType,status,year,runtime,genres,personalRating
          </ThemedText>
          <Input
            label="Paste CSV data"
            value={csvInput}
            onChangeText={setCsvInput}
            placeholder="title,mediaType,status,year&#10;Inception,movie,completed,2010"
            multiline
          />
          <Button onPress={handleImportCsv}>Import CSV</Button>
        </ThemedView>

        {result && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Import Result</ThemedText>
            <ThemedText>✅ {result.imported} imported</ThemedText>
            <ThemedText>⏭️ {result.skipped} skipped</ThemedText>
            {result.errors.length > 0 && (
              <>
                <ThemedText type="smallBold">Errors:</ThemedText>
                {result.errors.slice(0, 5).map((err, i) => (
                  <ThemedText key={i} type="small" style={{ color: theme.error }}>{err}</ThemedText>
                ))}
              </>
            )}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%', gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.four },
  section: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.three },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
});

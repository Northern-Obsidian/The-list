import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ErrorBoundary } from '@/components/error-boundary';
import { exportToJsonString, importBackup, getBackupHistory, getBackupSize, type BackupData } from '@/services/backup-service';
import { signInToDrive, uploadBackupToDrive, downloadBackupFromDrive, listBackupFiles, updateBackupDriveFileId } from '@/services/drive-service';

export default function BackupScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [backupSize, setBackupSize] = useState(0);
  const [backupHistory, setBackupHistory] = useState<{ id: string; createdAt: string; fileSize: number | null }[]>([]);
  const [jsonInput, setJsonInput] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveBackups, setDriveBackups] = useState<{ id: string; name: string; createdTime: string }[]>([]);
  const [driveBusy, setDriveBusy] = useState(false);

  useEffect(() => {
    setBackupSize(getBackupSize());
    setBackupHistory(getBackupHistory());
  }, []);

  const handleExport = useCallback(() => {
    const json = exportToJsonString();
    setExportJson(json);
    setShowExport(true);
  }, []);

  const handleCopy = useCallback(() => {
    Alert.alert('Backup Created', 'Backup has been generated. You can view it in the section below.');
  }, [exportJson]);

  const handleImport = useCallback(() => {
    if (!jsonInput.trim()) {
      Alert.alert('Error', 'Please paste backup JSON first');
      return;
    }
    try {
      const backup = JSON.parse(jsonInput) as BackupData;
      const result = importBackup(backup);
      if (result.success) {
        Alert.alert('Success', 'Backup restored successfully');
        setJsonInput('');
      } else {
        Alert.alert('Issues', `${result.errors.length} error(s) during import`);
      }
    } catch {
      Alert.alert('Error', 'Invalid JSON format');
    }
  }, [jsonInput]);

  const handleDriveSignIn = useCallback(async () => {
    setDriveBusy(true);
    const token = await signInToDrive();
    if (token) {
      setAccessToken(token);
      const files = await listBackupFiles(token);
      setDriveBackups(files);
    } else {
      Alert.alert('Sign In Failed', 'Could not authenticate with Google Drive. Check that EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID is set.');
    }
    setDriveBusy(false);
  }, []);

  const handleDriveUpload = useCallback(async () => {
    if (!accessToken) return;
    setDriveBusy(true);
    const json = exportToJsonString();
    const fileName = `the_list_backup_${new Date().toISOString().split('T')[0]}.json`;
    const fileId = await uploadBackupToDrive(accessToken, json, fileName);
    if (fileId) {
      const history = getBackupHistory(1);
      if (history.length > 0) {
        updateBackupDriveFileId(history[0].id, fileId);
      }
      const files = await listBackupFiles(accessToken);
      setDriveBackups(files);
      Alert.alert('Uploaded', `Backup saved to Google Drive as "${fileName}"`);
    } else {
      Alert.alert('Upload Failed', 'Could not upload backup to Google Drive.');
    }
    setDriveBusy(false);
  }, [accessToken]);

  const handleDriveRestore = useCallback(async (fileId: string) => {
    if (!accessToken) return;
    setDriveBusy(true);
    const json = await downloadBackupFromDrive(accessToken, fileId);
    if (json) {
      try {
        const backup = JSON.parse(json) as BackupData;
        const result = importBackup(backup);
        if (result.success) {
          Alert.alert('Restored', 'Backup restored from Google Drive successfully.');
        } else {
          Alert.alert('Issues', `${result.errors.length} error(s) during import`);
        }
      } catch {
        Alert.alert('Error', 'Invalid backup file from Google Drive.');
      }
    } else {
      Alert.alert('Download Failed', 'Could not download backup from Google Drive.');
    }
    setDriveBusy(false);
  }, [accessToken]);

  return (
    <ErrorBoundary name="BackupScreen">
    <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Done</ThemedText>
          </Pressable>
          <ThemedText type="subtitle">Backup & Restore</ThemedText>
          <View style={{ width: 50 }} />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Backup Size</ThemedText>
          <ThemedText>{(backupSize / 1024).toFixed(1)} KB</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your complete library including all media, series, episodes, reviews, and settings.
          </ThemedText>
        </ThemedView>

        <Button onPress={handleExport}>Create Backup</Button>

        {showExport && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Backup JSON</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={10}>
              {exportJson.substring(0, 2000)}...
            </ThemedText>
            <Button variant="secondary" onPress={handleCopy}>Copy to Clipboard</Button>
          </ThemedView>
        )}

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Google Drive</ThemedText>
          {driveBusy ? (
            <ActivityIndicator size="small" color="#3C9FFE" />
          ) : accessToken ? (
            <>
              <ThemedText type="small" themeColor="textSecondary">Connected to Google Drive</ThemedText>
              <Button onPress={handleDriveUpload}>Upload Backup to Drive</Button>
              {driveBackups.length > 0 && (
                <ThemedView style={styles.driveList}>
                  <ThemedText type="small" themeColor="textSecondary">Available backups:</ThemedText>
                  {driveBackups.map((f) => (
                    <Pressable
                      key={f.id}
                      style={({ pressed }) => [styles.driveItem, pressed && { opacity: 0.7 }]}
                      onPress={() => handleDriveRestore(f.id)}
                    >
                      <ThemedText type="small">{f.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">{new Date(f.createdTime).toLocaleDateString()}</ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
              )}
            </>
          ) : (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                Sign in to back up your data to Google Drive.
              </ThemedText>
              <Button variant="secondary" onPress={handleDriveSignIn}>Sign in with Google</Button>
            </>
          )}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Restore from Backup</ThemedText>
          <Input
            label="Paste backup JSON"
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder='{"data": {"media": [...]}}'
            multiline
          />
          <Button onPress={handleImport}>Restore</Button>
        </ThemedView>

        {backupHistory.length > 0 && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Backup History</ThemedText>
            {backupHistory.map((b) => (
              <ThemedView key={b.id} style={styles.historyItem}>
                <ThemedText type="small">{new Date(b.createdAt).toLocaleDateString()}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {b.fileSize ? `${(b.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: { flex: 1, paddingHorizontal: Spacing.four, maxWidth: MaxContentWidth, width: '100%', gap: Spacing.four, paddingBottom: Spacing.four },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.four },
  section: { borderRadius: Spacing.four, padding: Spacing.four, gap: Spacing.two },
  sectionTitle: { textTransform: 'uppercase', letterSpacing: 1 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.one },
  driveList: { gap: Spacing.two, marginTop: Spacing.two },
  driveItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.two, borderRadius: Spacing.two },
});

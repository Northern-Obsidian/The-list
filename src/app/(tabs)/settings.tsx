import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { eq } from 'drizzle-orm';
import { getDatabase, setActiveProfileId } from '@/db';
import { profiles as profilesSchema } from '@/db/schema';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/glass-card';
import { ErrorBoundary } from '@/components/error-boundary';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  isBiometricAvailable,
  isPinSet,
  removePin,
  setBiometricEnabled,
  setLockEnabled,
  setPin,
} from '@/services/app-lock-service';
import {
  cancelAllNotifications,
  registerBackgroundFetchAsync,
  requestNotificationPermissions,
  scheduleBackupReminderNotification,
  scheduleDailyGoalNotification,
  scheduleStreakReminderNotification,
  scheduleWeeklySummaryNotification,
  setupNotificationChannels,
  unregisterBackgroundFetchAsync,
} from '@/services/background-task-service';
import {
  useBackupReminderEnabled,
  useBiometricEnabled,
  useContinueReminderEnabled,
  useDailyGoalEnabled,
  useLockEnabled,
  useNotificationsEnabled,
  useReleaseReminderEnabled,
  useSetBackupReminderEnabled,
  useSetBiometricEnabled,
  useSetContinueReminderEnabled,
  useSetDailyGoalEnabled,
  useSetLockEnabled,
  useSetNotificationsEnabled,
  useSetReleaseReminderEnabled,
  useSetStreakReminderEnabled,
  useSetThemePreference,
  useSetWeeklySummaryEnabled,
  useStreakReminderEnabled,
  useThemePreference,
  useWeeklySummaryEnabled,
  type ThemeMode,
} from '@/stores/use-preference-store';

function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (_v: boolean) => void;
  label: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.toggleRow,
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => onValueChange(!value)}
    >
      <ThemedText>{label}</ThemedText>
      <View
        style={[
          styles.toggleTrack,
          {
            backgroundColor: value
              ? theme.primary || '#3C9FFE'
              : theme.backgroundElement,
          },
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            value && styles.toggleThumbActive,
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const themePref = useThemePreference();
  const setThemePref = useSetThemePreference();
  const lockEnabled = useLockEnabled();
  const setLockEnabledPref = useSetLockEnabled();
  const biometricEnabled = useBiometricEnabled();
  const setBiometricEnabledPref = useSetBiometricEnabled();
  const notificationsEnabled = useNotificationsEnabled();
  const setNotificationsEnabled = useSetNotificationsEnabled();
  const continueReminder = useContinueReminderEnabled();
  const setContinueReminder = useSetContinueReminderEnabled();
  const dailyGoal = useDailyGoalEnabled();
  const setDailyGoal = useSetDailyGoalEnabled();
  const weeklySummary = useWeeklySummaryEnabled();
  const setWeeklySummary = useSetWeeklySummaryEnabled();
  const streakReminder = useStreakReminderEnabled();
  const setStreakReminder = useSetStreakReminderEnabled();
  const backupReminder = useBackupReminderEnabled();
  const setBackupReminder = useSetBackupReminderEnabled();
  const releaseReminder = useReleaseReminderEnabled();
  const setReleaseReminder = useSetReleaseReminderEnabled();

  const [bioAvailable, setBioAvailable] = useState(false);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  useEffect(() => {
    (async () => {
      setBioAvailable(await isBiometricAvailable());
      setPinConfigured(await isPinSet());
    })();
  }, []);

  const handleLockToggle = useCallback(
    async (val: boolean) => {
      if (val && !pinConfigured) {
        setShowPinSetup(true);
        return;
      }
      await setLockEnabled(val);
      setLockEnabledPref(val);
    },
    [pinConfigured, setLockEnabledPref],
  );

  const handlePinSetup = useCallback(async () => {
    if (newPin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return;
    }
    await setPin(newPin);
    setPinConfigured(true);
    await setLockEnabled(true);
    setLockEnabledPref(true);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
  }, [newPin, confirmPin, setLockEnabledPref]);

  const handleRemovePin = useCallback(async () => {
    Alert.alert('Remove PIN', 'Are you sure? This will disable app lock.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removePin();
          setPinConfigured(false);
          await setLockEnabled(false);
          setLockEnabledPref(false);
        },
      },
    ]);
  }, [setLockEnabledPref]);

  const handleBiometricToggle = useCallback(
    async (val: boolean) => {
      if (val) {
        const ok = await isBiometricAvailable();
        if (!ok) {
          Alert.alert('Not Available', 'Biometric authentication is not available on this device');
          return;
        }
      }
      await setBiometricEnabled(val);
      setBiometricEnabledPref(val);
    },
    [setBiometricEnabledPref],
  );

  const handleNotificationsToggle = useCallback(
    async (val: boolean) => {
      if (val) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert('Permission Denied', 'Notification permission was not granted');
          return;
        }
        await registerBackgroundFetchAsync();
        await setupNotificationChannels();
      } else {
        await unregisterBackgroundFetchAsync();
        await cancelAllNotifications();
      }
      setNotificationsEnabled(val);
    },
    [setNotificationsEnabled],
  );

  const handleContinueReminderToggle = useCallback(
    async (val: boolean) => {
      setContinueReminder(val);
      if (val && notificationsEnabled) {
        await registerBackgroundFetchAsync();
      }
    },
    [setContinueReminder, notificationsEnabled],
  );

  const handleDailyGoalToggle = useCallback(
    async (val: boolean) => {
      setDailyGoal(val);
      if (val && notificationsEnabled) {
        await scheduleDailyGoalNotification();
      }
    },
    [setDailyGoal, notificationsEnabled],
  );

  const handleWeeklySummaryToggle = useCallback(
    async (val: boolean) => {
      setWeeklySummary(val);
      if (val && notificationsEnabled) {
        await scheduleWeeklySummaryNotification();
      }
    },
    [setWeeklySummary, notificationsEnabled],
  );

  const handleStreakReminderToggle = useCallback(
    async (val: boolean) => {
      setStreakReminder(val);
      if (val && notificationsEnabled) {
        await scheduleStreakReminderNotification();
      }
    },
    [setStreakReminder, notificationsEnabled],
  );

  const handleBackupReminderToggle = useCallback(
    async (val: boolean) => {
      setBackupReminder(val);
      if (val && notificationsEnabled) {
        await scheduleBackupReminderNotification();
      }
    },
    [setBackupReminder, notificationsEnabled],
  );

  const handleReleaseReminderToggle = useCallback(
    async (val: boolean) => {
      setReleaseReminder(val);
      if (val && notificationsEnabled) {
        await registerBackgroundFetchAsync();
      }
    },
    [setReleaseReminder, notificationsEnabled],
  );

  const [profiles, setProfiles] = useState<{ id: string; name: string; avatar: string | null; isActive: boolean }[]>([]);

  useEffect(() => {
    const { db } = getDatabase();
    const all = db.select().from(profilesSchema).all();
    setProfiles(all.map((p: Record<string, unknown>) => ({ id: p.id as string, name: p.name as string, avatar: p.avatar as string | null, isActive: !!p.isActive })));
  }, []);

  const handleSwitchProfile = useCallback((profileId: string) => {
    const { db } = getDatabase();
    db.update(profilesSchema).set({ isActive: false }).run();
    db.update(profilesSchema).set({ isActive: true }).where(eq(profilesSchema.id, profileId)).run();
    setActiveProfileId(profileId);
    setProfiles((prev) => prev.map((p) => ({ ...p, isActive: p.id === profileId })));
  }, []);

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: 'system', label: 'System' },
    { key: 'dark', label: 'Dark' },
    { key: 'light', label: 'Light' },
    { key: 'amoled', label: 'AMOLED' },
    { key: 'glass', label: 'Glass' },
    { key: 'cyberpunk', label: 'Cyberpunk' },
    { key: 'neon', label: 'Neon' },
    { key: 'minimal', label: 'Minimal' },
  ];

  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;

  return (
    <ErrorBoundary name="SettingsScreen">
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      contentInset={{ bottom: paddingBottom }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Settings</ThemedText>
        </ThemedView>

        {showPinSetup && (
          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Set Up PIN
            </ThemedText>
            <TextInput
              style={[
                styles.pinInput,
                { color: theme.text, backgroundColor: theme.background },
              ]}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter PIN (4-6 digits)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <TextInput
              style={[
                styles.pinInput,
                { color: theme.text, backgroundColor: theme.background },
              ]}
              value={confirmPin}
              onChangeText={setConfirmPin}
              placeholder="Confirm PIN"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <View style={styles.pinActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.pinButton,
                  { backgroundColor: theme.backgroundElement },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  setShowPinSetup(false);
                  setNewPin('');
                  setConfirmPin('');
                }}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.pinButton,
                  { backgroundColor: theme.primary || theme.backgroundSelected },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={handlePinSetup}
              >
                <ThemedText style={{ color: '#FFF' }}>Set PIN</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        )}

          <GlassCard>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Appearance
            </ThemedText>
          <View style={styles.themeOptions}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.key}
                style={({ pressed }) => [
                  styles.themeOption,
                  {
                    backgroundColor:
                      themePref === opt.key
                        ? theme.backgroundSelected
                        : theme.background,
                    borderColor:
                      themePref === opt.key
                        ? theme.primary || theme.border || 'transparent'
                        : theme.border || 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setThemePref(opt.key)}
              >
                <ThemedText
                  type="small"
                  themeColor={themePref === opt.key ? 'text' : 'textSecondary'}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        {profiles.length > 1 && (
          <GlassCard>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Profiles</ThemedText>
            {profiles.map((p) => (
              <Pressable
                key={p.id}
                style={({ pressed }) => [
                  styles.profileRow,
                  { backgroundColor: theme.background },
                  p.isActive && { borderColor: theme.primary, borderWidth: 1 },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleSwitchProfile(p.id)}
              >
                <ThemedText style={styles.profileAvatar}>{p.avatar || '👤'}</ThemedText>
                <ThemedText style={styles.profileName}>{p.name}</ThemedText>
                {p.isActive && <ThemedText type="small" style={{ color: theme.primary }}>Active</ThemedText>}
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.actionButton, { backgroundColor: theme.background }, pressed && { opacity: 0.7 }]}
              onPress={() => router.push('/profile')}
            >
              <ThemedText type="small">Manage Profiles →</ThemedText>
            </Pressable>
          </GlassCard>
        )}

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Security
          </ThemedText>
          <Toggle
            label="App Lock"
            value={lockEnabled}
            onValueChange={handleLockToggle}
          />
          {lockEnabled && (
            <>
              {bioAvailable && (
                <Toggle
                  label="Use Biometric"
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                />
              )}
              {pinConfigured && (
                <Pressable
                  style={({ pressed }) => [
                    styles.dangerButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={handleRemovePin}
                >
                  <ThemedText style={{ color: theme.error || '#F87171' }}>
                    Remove PIN
                  </ThemedText>
                </Pressable>
              )}
            </>
          )}
        </GlassCard>

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Notifications
          </ThemedText>
          <Toggle
            label="Enable Notifications"
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
          />
          {notificationsEnabled && (
            <>
              <Toggle
                label="Continue Watching"
                value={continueReminder}
                onValueChange={handleContinueReminderToggle}
              />
              <Toggle
                label="Daily Goal"
                value={dailyGoal}
                onValueChange={handleDailyGoalToggle}
              />
              <Toggle
                label="Weekly Summary"
                value={weeklySummary}
                onValueChange={handleWeeklySummaryToggle}
              />
              <Toggle
                label="Streak Reminder"
                value={streakReminder}
                onValueChange={handleStreakReminderToggle}
              />
              <Toggle
                label="Backup Reminder"
                value={backupReminder}
                onValueChange={handleBackupReminderToggle}
              />
              <Toggle
                label="Release Reminders"
                value={releaseReminder}
                onValueChange={handleReleaseReminderToggle}
              />
            </>
          )}
        </GlassCard>

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Data
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.background },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/backup')}
          >
            <ThemedText>Backup & Restore</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.background },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/import')}
          >
            <ThemedText>Import Data</ThemedText>
          </Pressable>

        </GlassCard>

        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            About
          </ThemedText>
          <ThemedView style={styles.aboutRow}>
            <ThemedText themeColor="textSecondary">Version</ThemedText>
            <ThemedText>1.0.0</ThemedText>
          </ThemedView>
          <ThemedView style={styles.aboutRow}>
            <ThemedText themeColor="textSecondary">App</ThemedText>
            <ThemedText>The_List</ThemedText>
          </ThemedView>
        </GlassCard>
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    gap: Spacing.five,
    paddingBottom: Spacing.four,
  },
  header: {
    paddingVertical: Spacing.three,
  },
  section: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  themeOption: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  dangerButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pinInput: {
    height: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  pinActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  pinButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  profileAvatar: { fontSize: 28 },
  profileName: { flex: 1, fontWeight: '600' },
});

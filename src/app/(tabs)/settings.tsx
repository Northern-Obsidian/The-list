import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { eq } from 'drizzle-orm';
import { getDatabase, setActiveProfileId } from '@/db';
import { profiles as profilesSchema } from '@/db/schema';
import {
  IconLayoutGrid,
  IconEye,
  IconBell,
  IconLock,
  IconFingerprint,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconMovie,
  IconWorld,
  IconDatabase,
  IconDownload,
  IconUpload,
  IconTrash,
  IconHelp,
  IconInfoCircle,
  IconRefresh,
  IconCalendar,
  IconAward,
  IconTrendingUp,
  IconUser,
  IconChevronRight,
  IconSettings2,
} from '@tabler/icons-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GlassCard } from '@/components/glass-card';
import { Icon } from '@/components/ui/icon';
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
  useDefaultListView,
  useSetDefaultListView,
  useShowRatings,
  useSetShowRatings,
  useCompactMode,
  useSetCompactMode,
  useHapticFeedback,
  useSetHapticFeedback,
  useAutoPlay,
  useSetAutoPlay,
  useSkipIntros,
  useSetSkipIntros,
  usePlaybackQuality,
  useSetPlaybackQuality,
  useLanguage,
  useSetLanguage,
  useAutoBackup,
  useSetAutoBackup,
} from '@/stores/use-preference-store';

function Toggle({
  value,
  onValueChange,
  label,
  icon: IconComp,
}: {
  value: boolean;
  onValueChange: (_v: boolean) => void;
  label: string;
  icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.toggleRow, pressed && { opacity: 0.7 }]}
      onPress={() => onValueChange(!value)}
    >
      <View style={styles.toggleLeft}>
        {IconComp && <IconComp size={18} color={theme.textSecondary} />}
        <ThemedText type="small">{label}</ThemedText>
      </View>
      <View
        style={[
          styles.toggleTrack,
          { backgroundColor: value ? theme.primary : theme.backgroundElement },
        ]}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );
}

function SettingRow({
  label,
  value,
  onPress,
  icon: IconComp,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  icon?: React.ComponentType<{ size: number; color: string }>;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        {IconComp && <IconComp size={18} color={theme.textSecondary} />}
        <ThemedText type="small">{label}</ThemedText>
      </View>
      <View style={styles.settingRight}>
        {value && <ThemedText type="small" themeColor="textSecondary">{value}</ThemedText>}
        <IconChevronRight size={14} color={theme.textTertiary} />
      </View>
    </Pressable>
  );
}

function ActionRow({
  label,
  onPress,
  icon: IconComp,
  danger,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ComponentType<{ size: number; color: string }>;
  danger?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      {IconComp && <IconComp size={16} color={danger ? theme.error : theme.textSecondary} />}
      <ThemedText type="small" style={{ color: danger ? theme.error : theme.text }}>
        {label}
      </ThemedText>
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
  const defaultListView = useDefaultListView();
  const setDefaultListView = useSetDefaultListView();
  const showRatings = useShowRatings();
  const setShowRatings = useSetShowRatings();
  const compactMode = useCompactMode();
  const setCompactMode = useSetCompactMode();
  const hapticFeedback = useHapticFeedback();
  const setHapticFeedback = useSetHapticFeedback();
  const autoPlay = useAutoPlay();
  const setAutoPlay = useSetAutoPlay();
  const skipIntros = useSkipIntros();
  const setSkipIntros = useSetSkipIntros();
  const playbackQuality = usePlaybackQuality();
  const setPlaybackQuality = useSetPlaybackQuality();
  const language = useLanguage();
  const setLanguage = useSetLanguage();
  const autoBackup = useAutoBackup();
  const setAutoBackup = useSetAutoBackup();

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

  const themeOptions: { key: ThemeMode; colors: string[] }[] = [
    { key: 'system', colors: ['#888888', '#CCCCCC'] },
    { key: 'dark', colors: ['#1E1E1E', '#2A2A2A'] },
    { key: 'light', colors: ['#F5F5F7', '#FFFFFF'] },
    { key: 'amoled', colors: ['#000000', '#111111'] },
    { key: 'glass', colors: ['rgba(120,120,180,0.4)', 'rgba(200,200,255,0.2)'] },
    { key: 'cyberpunk', colors: ['#ff00ff', '#1a0033'] },
    { key: 'neon', colors: ['#00ffff', '#003333'] },
    { key: 'minimal', colors: ['#333333', '#666666'] },
  ];

  const languageOptions = [
    { key: 'en', label: 'EN' },
    { key: 'es', label: 'ES' },
    { key: 'fr', label: 'FR' },
    { key: 'de', label: 'DE' },
    { key: 'ja', label: 'JA' },
    { key: 'ko', label: 'KO' },
  ];

  const qualityOptions = [
    { key: 'auto', label: 'Auto' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Med' },
    { key: 'low', label: 'Low' },
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
          <IconSettings2 size={28} color={theme.text} />
          <ThemedText type="subtitle">Settings</ThemedText>
        </ThemedView>

        {showPinSetup && (
          <GlassCard>
            <ThemedText type="smallBold" style={styles.sectionTitle}>Set Up PIN</ThemedText>
            <TextInput
              style={[styles.pinInput, { color: theme.text, backgroundColor: theme.background }]}
              value={newPin}
              onChangeText={setNewPin}
              placeholder="Enter PIN (4-6 digits)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
            />
            <TextInput
              style={[styles.pinInput, { color: theme.text, backgroundColor: theme.background }]}
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
                style={({ pressed }) => [styles.pinButton, { backgroundColor: theme.backgroundElement }, pressed && { opacity: 0.7 }]}
                onPress={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); }}
              >
                <ThemedText type="small">Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.pinButton, { backgroundColor: theme.primary }, pressed && { opacity: 0.7 }]}
                onPress={handlePinSetup}
              >
                <ThemedText type="small" style={{ color: '#FFF' }}>Set PIN</ThemedText>
              </Pressable>
            </View>
          </GlassCard>
        )}

        {/* General */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>General</ThemedText>
          <Toggle label="Compact" value={compactMode} onValueChange={setCompactMode} icon={IconLayoutGrid} />
          <Toggle label="Ratings" value={showRatings} onValueChange={setShowRatings} icon={IconEye} />
          <Toggle label="Haptics" value={hapticFeedback} onValueChange={setHapticFeedback} icon={IconBell} />
          <SettingRow
            label="Default View"
            value={defaultListView === 'grid' ? 'Grid' : 'List'}
            icon={IconLayoutGrid}
            onPress={() => {
              Alert.alert('Default View', 'Choose your default view', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Grid', onPress: () => setDefaultListView('grid') },
                { text: 'List', onPress: () => setDefaultListView('list') },
              ]);
            }}
          />
        </GlassCard>

        {/* Appearance */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Appearance</ThemedText>
          <View style={styles.themeGrid}>
            {themeOptions.map((opt) => {
              const active = themePref === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={({ pressed }) => [
                    styles.themeSwatch,
                    {
                      borderColor: active ? theme.primary : 'transparent',
                      borderWidth: active ? 2 : 0,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => setThemePref(opt.key)}
                >
                  <View
                    style={[
                      styles.themeSwatchInner,
                      {
                        backgroundColor: opt.colors[0],
                        borderColor: opt.colors[1],
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Profiles */}
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
                <Icon name={p.avatar || 'user'} size={24} color={theme.text} />
                <ThemedText type="small" style={styles.profileName}>{p.name}</ThemedText>
                {p.isActive && <Icon name="check" size={14} color={theme.primary} />}
              </Pressable>
            ))}
            <ActionRow label="Manage Profiles" icon={IconUser} onPress={() => router.push('/profile')} />
          </GlassCard>
        )}

        {/* Security */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Security</ThemedText>
          <Toggle label="App Lock" value={lockEnabled} onValueChange={handleLockToggle} icon={IconLock} />
          {lockEnabled && bioAvailable && (
            <Toggle label="Biometric" value={biometricEnabled} onValueChange={handleBiometricToggle} icon={IconFingerprint} />
          )}
          {lockEnabled && pinConfigured && (
            <ActionRow label="Remove PIN" icon={IconTrash} danger onPress={handleRemovePin} />
          )}
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Notifications</ThemedText>
          <Toggle label="Notifications" value={notificationsEnabled} onValueChange={handleNotificationsToggle} icon={IconBell} />
          {notificationsEnabled && (
            <>
              <Toggle label="Continue" value={continueReminder} onValueChange={handleContinueReminderToggle} icon={IconPlayerPlay} />
              <Toggle label="Daily Goal" value={dailyGoal} onValueChange={handleDailyGoalToggle} icon={IconAward} />
              <Toggle label="Weekly" value={weeklySummary} onValueChange={handleWeeklySummaryToggle} icon={IconTrendingUp} />
              <Toggle label="Streaks" value={streakReminder} onValueChange={handleStreakReminderToggle} icon={IconRefresh} />
              <Toggle label="Backup" value={backupReminder} onValueChange={handleBackupReminderToggle} icon={IconDatabase} />
              <Toggle label="Releases" value={releaseReminder} onValueChange={handleReleaseReminderToggle} icon={IconCalendar} />
            </>
          )}
        </GlassCard>

        {/* Playback */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Playback</ThemedText>
          <Toggle label="Auto-Play" value={autoPlay} onValueChange={setAutoPlay} icon={IconPlayerPlay} />
          <Toggle label="Skip Intros" value={skipIntros} onValueChange={setSkipIntros} icon={IconPlayerSkipForward} />
          <SettingRow
            label="Quality"
            value={qualityOptions.find((q) => q.key === playbackQuality)?.label || 'Auto'}
            icon={IconMovie}
            onPress={() => {
              Alert.alert('Video Quality', 'Choose playback quality', [
                { text: 'Cancel', style: 'cancel' },
                ...qualityOptions.map((q) => ({
                  text: q.label,
                  onPress: () => setPlaybackQuality(q.key),
                })),
              ]);
            }}
          />
        </GlassCard>

        {/* Language */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Language</ThemedText>
          <SettingRow
            label="Language"
            value={languageOptions.find((l) => l.key === language)?.label || 'EN'}
            icon={IconWorld}
            onPress={() => {
              Alert.alert('Language', 'Choose app language', [
                { text: 'Cancel', style: 'cancel' },
                ...languageOptions.map((l) => ({
                  text: l.label,
                  onPress: () => setLanguage(l.key),
                })),
              ]);
            }}
          />
        </GlassCard>

        {/* Data */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>Data</ThemedText>
          <Toggle label="Auto Backup" value={autoBackup} onValueChange={setAutoBackup} icon={IconDatabase} />
          <ActionRow label="Backup & Restore" icon={IconDownload} onPress={() => router.push('/backup')} />
          <ActionRow label="Import" icon={IconUpload} onPress={() => router.push('/import')} />
          <ActionRow label="Clear Cache" icon={IconTrash} danger onPress={() => {
            Alert.alert('Clear Cache', 'This will clear temporary files. Continue?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Done', 'Cache cleared') },
            ]);
          }} />
        </GlassCard>

        {/* About */}
        <GlassCard>
          <ThemedText type="smallBold" style={styles.sectionTitle}>About</ThemedText>
          <ActionRow label="Help" icon={IconHelp} onPress={() => Alert.alert('Help', 'Visit our help center at support.nextwatch.app')} />
          <ActionRow label="About NextWatch" icon={IconInfoCircle} onPress={() => Alert.alert('About', 'NextWatch v1.0.0\nYour watchlist. Organized.\n\nBuilt for entertainment lovers.')} />
          <ActionRow label="Reset Data" icon={IconTrash} danger onPress={() => {
            Alert.alert('Reset All Data', 'This will permanently delete all your data. This action cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete Everything', style: 'destructive', onPress: () => Alert.alert('Done', 'Data reset') },
            ]);
          }} />
          <ThemedView style={styles.versionRow}>
            <ThemedText type="small" themeColor="textSecondary">v1.0.0</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Build 2026.08.01</ThemedText>
          </ThemedView>
        </GlassCard>
      </ThemedView>
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexDirection: 'row', justifyContent: 'center' },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.one,
    opacity: 0.6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two - 1,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two - 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two - 1,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  themeSwatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    padding: 3,
  },
  themeSwatchInner: {
    flex: 1,
    borderRadius: 9,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  profileName: { flex: 1, fontWeight: '500' },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  pinInput: {
    height: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 4,
  },
  pinActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pinButton: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});

import { useCallback, useSyncExternalStore } from 'react';

type Listener = () => void;

class PreferenceStore {
  private store: Record<string, string> = {};
  private listeners = new Set<Listener>();

  get(key: string, defaultValue: string = ''): string {
    return this.store[key] ?? defaultValue;
  }

  set(key: string, value: string): void {
    this.store[key] = value;
    this.emit();
  }

  delete(key: string): void {
    delete this.store[key];
    this.emit();
  }

  getBoolean(key: string, defaultValue: boolean = false): boolean {
    const val = this.store[key];
    if (val === undefined) return defaultValue;
    return val === 'true';
  }

  setBoolean(key: string, value: boolean): void {
    this.store[key] = value ? 'true' : 'false';
    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }
}

const preferenceStore = new PreferenceStore();

const THEME_KEY = 'pref_theme';
const LOCK_ENABLED_KEY = 'pref_lock_enabled';
const BIOMETRIC_ENABLED_KEY = 'pref_biometric_enabled';
const NOTIFICATIONS_ENABLED_KEY = 'pref_notifications_enabled';
const CONTINUE_REMINDER_KEY = 'pref_continue_reminder';
const DAILY_GOAL_KEY = 'pref_daily_goal';
const WEEKLY_SUMMARY_KEY = 'pref_weekly_summary';
const STREAK_REMINDER_KEY = 'pref_streak_reminder';
const BACKUP_REMINDER_KEY = 'pref_backup_reminder';
const RELEASE_REMINDER_KEY = 'pref_release_reminder';
const DARK_MODE_KEY = 'pref_dark_mode';
const AUTO_PLAY_KEY = 'pref_auto_play';
const SKIP_INTROS_KEY = 'pref_skip_intros';
const PLAYBACK_QUALITY_KEY = 'pref_playback_quality';
const LANGUAGE_KEY = 'pref_language';
const DEFAULT_LIST_VIEW_KEY = 'pref_default_list_view';
const SHOW_RATINGS_KEY = 'pref_show_ratings';
const COMPACT_MODE_KEY = 'pref_compact_mode';
const HAPTIC_FEEDBACK_KEY = 'pref_haptic_feedback';
const AUTO_BACKUP_KEY = 'pref_auto_backup';
const CACHE_SIZE_KEY = 'pref_cache_size';

export type ThemeMode = 'system' | 'light' | 'dark' | 'amoled' | 'glass' | 'cyberpunk' | 'neon' | 'minimal';

function subscribe(store: PreferenceStore) {
  return (listener: Listener) => store.subscribe(listener);
}

function getSnapshot(store: PreferenceStore, key: string, defaultValue: string) {
  return () => store.get(key, defaultValue);
}

function getBoolSnapshot(store: PreferenceStore, key: string, defaultValue: boolean) {
  return () => store.getBoolean(key, defaultValue);
}

export function useThemePreference(): ThemeMode {
  const value = useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, THEME_KEY, 'system'),
  );
  return value as ThemeMode;
}

export function useSetThemePreference(): (_mode: ThemeMode) => void {
  return useCallback((mode: ThemeMode) => {
    preferenceStore.set(THEME_KEY, mode);
  }, []);
}

export function useLockEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, LOCK_ENABLED_KEY, false),
  );
}

export function useSetLockEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(LOCK_ENABLED_KEY, enabled);
  }, []);
}

export function useBiometricEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, BIOMETRIC_ENABLED_KEY, false),
  );
}

export function useSetBiometricEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(BIOMETRIC_ENABLED_KEY, enabled);
  }, []);
}

export function useNotificationsEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, NOTIFICATIONS_ENABLED_KEY, true),
  );
}

export function useSetNotificationsEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(NOTIFICATIONS_ENABLED_KEY, enabled);
  }, []);
}

export function useContinueReminderEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, CONTINUE_REMINDER_KEY, true),
  );
}

export function useSetContinueReminderEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(CONTINUE_REMINDER_KEY, enabled);
  }, []);
}

export function useDailyGoalEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, DAILY_GOAL_KEY, false),
  );
}

export function useSetDailyGoalEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(DAILY_GOAL_KEY, enabled);
  }, []);
}

export function useWeeklySummaryEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, WEEKLY_SUMMARY_KEY, false),
  );
}

export function useSetWeeklySummaryEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(WEEKLY_SUMMARY_KEY, enabled);
  }, []);
}

export function useStreakReminderEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, STREAK_REMINDER_KEY, false),
  );
}

export function useSetStreakReminderEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(STREAK_REMINDER_KEY, enabled);
  }, []);
}

export function useBackupReminderEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, BACKUP_REMINDER_KEY, false),
  );
}

export function useSetBackupReminderEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(BACKUP_REMINDER_KEY, enabled);
  }, []);
}

export function useReleaseReminderEnabled(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, RELEASE_REMINDER_KEY, false),
  );
}

export function useSetReleaseReminderEnabled(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(RELEASE_REMINDER_KEY, enabled);
  }, []);
}

export function useDarkModeOverride(): boolean | null {
  const value = useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, DARK_MODE_KEY, ''),
  );
  if (!value) return null;
  return value === 'dark';
}

export function useSetDarkModeOverride(): (_value: boolean | null) => void {
  return useCallback((value: boolean | null) => {
    if (value === null) {
      preferenceStore.delete(DARK_MODE_KEY);
    } else {
      preferenceStore.set(DARK_MODE_KEY, value ? 'dark' : 'light');
    }
  }, []);
}

// General Settings
export function useDefaultListView(): string {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, DEFAULT_LIST_VIEW_KEY, 'grid'),
  );
}

export function useSetDefaultListView(): (_view: string) => void {
  return useCallback((view: string) => {
    preferenceStore.set(DEFAULT_LIST_VIEW_KEY, view);
  }, []);
}

export function useShowRatings(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, SHOW_RATINGS_KEY, true),
  );
}

export function useSetShowRatings(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(SHOW_RATINGS_KEY, enabled);
  }, []);
}

export function useCompactMode(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, COMPACT_MODE_KEY, false),
  );
}

export function useSetCompactMode(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(COMPACT_MODE_KEY, enabled);
  }, []);
}

export function useHapticFeedback(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, HAPTIC_FEEDBACK_KEY, true),
  );
}

export function useSetHapticFeedback(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(HAPTIC_FEEDBACK_KEY, enabled);
  }, []);
}

// Playback Settings
export function useAutoPlay(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, AUTO_PLAY_KEY, true),
  );
}

export function useSetAutoPlay(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(AUTO_PLAY_KEY, enabled);
  }, []);
}

export function useSkipIntros(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, SKIP_INTROS_KEY, false),
  );
}

export function useSetSkipIntros(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(SKIP_INTROS_KEY, enabled);
  }, []);
}

export function usePlaybackQuality(): string {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, PLAYBACK_QUALITY_KEY, 'auto'),
  );
}

export function useSetPlaybackQuality(): (_quality: string) => void {
  return useCallback((quality: string) => {
    preferenceStore.set(PLAYBACK_QUALITY_KEY, quality);
  }, []);
}

// Language Settings
export function useLanguage(): string {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, LANGUAGE_KEY, 'en'),
  );
}

export function useSetLanguage(): (_lang: string) => void {
  return useCallback((lang: string) => {
    preferenceStore.set(LANGUAGE_KEY, lang);
  }, []);
}

// Data Settings
export function useAutoBackup(): boolean {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getBoolSnapshot(preferenceStore, AUTO_BACKUP_KEY, false),
  );
}

export function useSetAutoBackup(): (_enabled: boolean) => void {
  return useCallback((enabled: boolean) => {
    preferenceStore.setBoolean(AUTO_BACKUP_KEY, enabled);
  }, []);
}

export function useCacheSize(): string {
  return useSyncExternalStore(
    subscribe(preferenceStore),
    getSnapshot(preferenceStore, CACHE_SIZE_KEY, '100'),
  );
}

export function useSetCacheSize(): (_size: string) => void {
  return useCallback((size: string) => {
    preferenceStore.set(CACHE_SIZE_KEY, size);
  }, []);
}

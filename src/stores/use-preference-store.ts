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

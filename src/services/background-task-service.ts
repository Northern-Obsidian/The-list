import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  checkAndScheduleContinueWatching,
  scheduleDailyGoalReminder,
  scheduleWeeklySummary,
  scheduleStreakReminder,
  scheduleBackupReminder,
  scheduleReleaseReminders,
  calculateCurrentStreak,
  cancelAllNotifications as cancelAll,
  requestNotificationPermissions as requestPerms,
} from './notification-service';

const BACKGROUND_FETCH_TASK = 'thelist-background-fetch';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function setupNotificationChannels(): void {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }
}

Notifications.addNotificationResponseReceivedListener((response) => {
  const { data } = response.notification.request.content;
  if (!data?.type) return;
  try {
    const { router } = require('expo-router');
    switch (data.type) {
      case 'continue_watching':
      case 'release_reminder':
        if (data.mediaId) {
          router.push(`/media/${data.mediaId}`);
        }
        break;
    }
  } catch {
  }
});

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await Promise.allSettled([
      checkAndScheduleContinueWatching(),
      scheduleReleaseReminders(),
    ]);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) return;
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

export async function unregisterBackgroundFetchAsync(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
  }
}

export async function setupAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await registerBackgroundFetchAsync();

  await Promise.allSettled([
    scheduleWeeklySummary(),
    scheduleBackupReminder(),
  ]);

  const streak = await calculateCurrentStreak();
  if (streak > 0) {
    await scheduleStreakReminder(streak);
  }
}

export {
  checkAndScheduleContinueWatching as scheduleContinueWatchingReminder,
  scheduleDailyGoalReminder as scheduleDailyGoalNotification,
  scheduleWeeklySummary,
  scheduleWeeklySummary as scheduleWeeklySummaryNotification,
  scheduleStreakReminder,
  scheduleStreakReminder as scheduleStreakReminderNotification,
  scheduleBackupReminder,
  scheduleBackupReminder as scheduleBackupReminderNotification,
  scheduleReleaseReminders,
  calculateCurrentStreak,
};

export async function cancelAllNotifications(): Promise<void> {
  await cancelAll();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  return requestPerms();
}

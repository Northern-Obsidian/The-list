import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDatabase } from '@/db';
import { media } from '@/db/schema/media';
import { series } from '@/db/schema/series';
import { watchHistory } from '@/db/schema/watch-history';
import { eq, and, lt, lte, sql, gte } from 'drizzle-orm';

export async function checkAndScheduleContinueWatching(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.some((n) => n.content.data?.type === 'continue_watching')) return;

  try {
    const { db } = getDatabase();
    const stale = db
      .select({ id: media.id, title: media.title })
      .from(media)
      .where(
        and(
          eq(media.status, 'watching'),
          lt(media.updatedAt, new Date(Date.now() - 3 * 86400000).toISOString()),
        ),
      )
      .all();

    for (const item of stale) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Continue Watching',
          body: `Pick up where you left off on "${item.title}"`,
          data: { type: 'continue_watching', mediaId: item.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 86400,
          repeats: false,
        },
      });
    }
  } catch (e) {
    if (__DEV__) console.warn('scheduleContinueWatching failed:', e);
  }
}

export async function scheduleDailyGoalReminder(
  goalType?: string,
  hour: number = 20,
  minute: number = 0,
): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Goal',
      body: goalType
        ? `You haven't reached your ${goalType} goal today. Time to catch up!`
        : "You haven't reached your daily goal yet. Time to catch up!",
      data: { type: 'daily_goal' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleWeeklySummary(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your Weekly Summary',
      body: 'See what you watched this week and check your stats!',
      data: { type: 'weekly_summary' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1,
      hour: 10,
      minute: 0,
    },
  });
}

export async function scheduleStreakReminder(streak?: number): Promise<void> {
  if (streak === undefined) {
    streak = await calculateCurrentStreak();
  }
  if (streak === 0) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Keep Your Streak Alive!',
      body: `You're on a ${streak}-day streak! Watch something today to keep it going.`,
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

export async function scheduleBackupReminder(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Backup Reminder',
      body: "It's been a while since your last backup. Protect your data!",
      data: { type: 'backup_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7 * 86400,
      repeats: true,
    },
  });
}

export async function scheduleReleaseReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existingMediaIds = new Set(
      scheduled
        .filter((n) => n.content.data?.type === 'release_reminder')
        .map((n) => n.content.data?.mediaId as string)
        .filter(Boolean),
    );

    const { db } = getDatabase();
    const now = new Date().toISOString();
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

    const upcoming = db
      .select({
        id: series.id,
        title: media.title,
        nextEpisodeDate: series.nextEpisodeDate,
      })
      .from(series)
      .innerJoin(media, eq(series.id, media.id))
      .where(
        and(
          gte(series.nextEpisodeDate, now),
          lte(series.nextEpisodeDate, weekFromNow),
        ),
      )
      .all();

    for (const item of upcoming) {
      if (!item.nextEpisodeDate) continue;
      if (existingMediaIds.has(item.id)) continue;
      const releaseDate = new Date(item.nextEpisodeDate);
      const nowDate = new Date();
      const msUntilRelease = releaseDate.getTime() - nowDate.getTime();

      if (msUntilRelease <= 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Episode Available',
          body: `A new episode of "${item.title}" is available!`,
          data: { type: 'release_reminder', mediaId: item.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(Math.floor(msUntilRelease / 1000), 60),
          repeats: false,
        },
      });
    }
  } catch {}
}

export async function calculateCurrentStreak(): Promise<number> {
  try {
    const { db } = getDatabase();
    const entries = db
      .select({ watchedAt: watchHistory.watchedAt })
      .from(watchHistory)
      .orderBy(sql`${watchHistory.watchedAt} DESC`)
      .all();

    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDays = new Set<string>();
    for (const entry of entries) {
      const d = new Date(entry.watchedAt);
      uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }

    const sortedDays = Array.from(uniqueDays)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const checkDate = new Date(today);

    for (const day of sortedDays) {
      const diff = Math.round(
        (checkDate.getTime() - day.getTime()) / 86400000,
      );
      if (diff === streak) {
        streak++;
      } else if (diff > streak) {
        break;
      }
    }

    return streak;
  } catch {
    return 0;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  if (existing.canAskAgain) {
    const result = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return result.granted;
  }

  return false;
}

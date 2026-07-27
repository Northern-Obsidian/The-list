import { eq, sql } from 'drizzle-orm';
import { getDatabase, getActiveProfileId } from '@/db';
import { achievements, media, episodes } from '@/db/schema';
import { generateId } from '@/utils/generate-id';

export interface Achievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  progressCurrent: number;
  progressTarget: number;
  unlockedAt: string | null;
  isSecret: boolean;
  category: string;
}

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progressCurrent' | 'unlockedAt'>[] = [
  { key: 'first_item', title: 'First Steps', description: 'Add your first item to your library', icon: '🎯', progressTarget: 1, isSecret: false, category: 'collection' },
  { key: 'library_10', title: 'Growing Library', description: 'Add 10 items to your library', icon: '📚', progressTarget: 10, isSecret: false, category: 'collection' },
  { key: 'library_50', title: 'Bookworm', description: 'Add 50 items to your library', icon: '📚', progressTarget: 50, isSecret: false, category: 'collection' },
  { key: 'library_100', title: 'Curator', description: 'Add 100 items to your library', icon: '🏛️', progressTarget: 100, isSecret: false, category: 'collection' },
  { key: 'library_500', title: 'Archivist', description: 'Add 500 items to your library', icon: '🏛️', progressTarget: 500, isSecret: false, category: 'collection' },
  { key: 'first_complete', title: 'All Done', description: 'Complete your first item', icon: '✅', progressTarget: 1, isSecret: false, category: 'completion' },
  { key: 'complete_10', title: 'Completionist', description: 'Complete 10 items', icon: '🏆', progressTarget: 10, isSecret: false, category: 'completion' },
  { key: 'complete_50', title: 'Master Completionist', description: 'Complete 50 items', icon: '🏆', progressTarget: 50, isSecret: false, category: 'completion' },
  { key: 'first_episode', title: 'First Episode', description: 'Watch your first episode', icon: '▶️', progressTarget: 1, isSecret: false, category: 'episodes' },
  { key: 'episode_100', title: 'Binge Watcher', description: 'Watch 100 episodes', icon: '📺', progressTarget: 100, isSecret: false, category: 'episodes' },
  { key: 'episode_500', title: 'Marathon Runner', description: 'Watch 500 episodes', icon: '🏃', progressTarget: 500, isSecret: false, category: 'episodes' },
  { key: 'episode_1000', title: 'Legendary Viewer', description: 'Watch 1000 episodes', icon: '👑', progressTarget: 1000, isSecret: false, category: 'episodes' },
  { key: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', progressTarget: 7, isSecret: false, category: 'streaks' },
  { key: 'streak_30', title: 'Monthly Devotion', description: 'Maintain a 30-day streak', icon: '🔥', progressTarget: 30, isSecret: false, category: 'streaks' },
  { key: 'streak_100', title: 'Century Streak', description: 'Maintain a 100-day streak', icon: '💯', progressTarget: 100, isSecret: false, category: 'streaks' },
  { key: 'streak_365', title: 'Year of Entertainment', description: 'Maintain a 365-day streak', icon: '🎉', progressTarget: 365, isSecret: false, category: 'streaks' },
  { key: 'first_review', title: 'Critic', description: 'Write your first review', icon: '✍️', progressTarget: 1, isSecret: false, category: 'reviews' },
  { key: 'first_rating', title: 'Rate It', description: 'Rate your first item', icon: '⭐', progressTarget: 1, isSecret: false, category: 'ratings' },
  { key: 'first_favorite', title: 'Favorite', description: 'Mark your first item as favorite', icon: '❤️', progressTarget: 1, isSecret: false, category: 'favorites' },
  { key: 'favorite_10', title: 'Loyal Fan', description: 'Mark 10 items as favorites', icon: '❤️', progressTarget: 10, isSecret: false, category: 'favorites' },
  { key: 'diverse_5', title: 'Explorer', description: 'Watch items from 5 different types', icon: '🧭', progressTarget: 5, isSecret: false, category: 'diversity' },
  { key: 'diverse_10', title: 'Omnivore', description: 'Watch items from 10 different types', icon: '🦚', progressTarget: 10, isSecret: false, category: 'diversity' },
  { key: 'night_owl', title: 'Night Owl', description: 'Watch something after midnight', icon: '🦉', progressTarget: 1, isSecret: true, category: 'fun' },
  { key: 'early_bird', title: 'Early Bird', description: 'Watch something before 6 AM', icon: '🐦', progressTarget: 1, isSecret: true, category: 'fun' },
  { key: 'rewatch_1', title: 'Double Dip', description: 'Rewatch your first item', icon: '🔄', progressTarget: 1, isSecret: false, category: 'rewatches' },
  { key: 'rewatch_10', title: 'Veteran Viewer', description: 'Rewatch 10 items', icon: '🔄', progressTarget: 10, isSecret: false, category: 'rewatches' },
  { key: 'backup_1', title: 'Safe Keeper', description: 'Create your first backup', icon: '💾', progressTarget: 1, isSecret: false, category: 'backup' },
  { key: 'collection_1', title: 'Organizer', description: 'Create your first collection', icon: '📁', progressTarget: 1, isSecret: false, category: 'collections' },
  { key: 'collection_5', title: 'Curator', description: 'Create 5 collections', icon: '📁', progressTarget: 5, isSecret: false, category: 'collections' },
  { key: 'all_genres', title: 'Genre Master', description: 'Watch items from every genre', icon: '🎭', progressTarget: 16, isSecret: true, category: 'fun' },
];

export function getAchievementDefinitions() {
  return ACHIEVEMENT_DEFINITIONS;
}

export function getUserAchievements(profileId?: string): Achievement[] {
  const { db } = getDatabase();
  profileId = profileId || getActiveProfileId();
  const userAchievements = db
    .select()
    .from(achievements)
    .where(eq(achievements.profileId, profileId))
    .all();

  const achievementMap = new Map(userAchievements.map((a) => [a.key, a]));

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const existing = achievementMap.get(def.key);
    const progress = computeAchievementProgress(def.key, profileId);
    return {
      ...def,
      progressCurrent: progress.current,
      progressTarget: def.progressTarget,
      unlockedAt: existing?.unlockedAt || null,
    };
  });
}

function computeAchievementProgress(key: string, _profileId: string): { current: number } {
  const { db } = getDatabase();

  switch (key) {
    case 'first_item':
    case 'library_10':
    case 'library_50':
    case 'library_100':
    case 'library_500': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const count = db.select({ c: sql<number>`count(*)` }).from(media).get();
      return { current: Math.min(count?.c || 0, target) };
    }

    case 'first_complete':
    case 'complete_10':
    case 'complete_50': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const count = db.select({ c: sql<number>`count(*)` }).from(media).where(eq(media.status, 'completed')).get();
      return { current: Math.min(count?.c || 0, target) };
    }

    case 'first_episode':
    case 'episode_100':
    case 'episode_500':
    case 'episode_1000': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const count = db.select({ c: sql<number>`count(*)` }).from(episodes).where(eq(episodes.watched, true)).get();
      return { current: Math.min(count?.c || 0, target) };
    }

    case 'first_rating': {
      const count = db.select({ c: sql<number>`count(*)` }).from(media).where(sql`personal_rating IS NOT NULL`).get();
      return { current: Math.min(count?.c || 0, 1) };
    }

    case 'first_favorite':
    case 'favorite_10': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const count = db.select({ c: sql<number>`count(*)` }).from(media).where(eq(media.favorite, true)).get();
      return { current: Math.min(count?.c || 0, target) };
    }

    case 'diverse_5':
    case 'diverse_10': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const types = db.select({ type: media.mediaType }).from(media).groupBy(media.mediaType).all();
      return { current: Math.min(types.length, target) };
    }

    case 'rewatch_1':
    case 'rewatch_10': {
      const target = ACHIEVEMENT_DEFINITIONS.find((a) => a.key === key)!.progressTarget;
      const count = db.select({ c: sql<number>`sum(${media.rewatchCount})` }).from(media).get();
      return { current: Math.min(count?.c || 0, target) };
    }

    default:
      return { current: 0 };
  }
}

export function checkAndUnlockAchievements(profileId?: string): Achievement[] {
  const { db } = getDatabase();
  profileId = profileId || getActiveProfileId();
  const newlyUnlocked: Achievement[] = [];
  const userAchievements = getUserAchievements(profileId);

  for (const ach of userAchievements) {
    if (ach.unlockedAt) continue;
    if (ach.progressCurrent >= ach.progressTarget) {
      const now = new Date().toISOString();
          db.insert(achievements)
        .values({
          id: generateId(),
          profileId,
          key: ach.key,
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          unlockedAt: now,
          progressCurrent: ach.progressCurrent,
          progressTarget: ach.progressTarget,
          isSecret: ach.isSecret,
        })
        .run();
      newlyUnlocked.push({ ...ach, unlockedAt: now });
    }
  }

  return newlyUnlocked;
}

export function getAchievementStats(profileId?: string) {
  profileId = profileId || getActiveProfileId();
  const userAchievements = getUserAchievements(profileId);
  const total = userAchievements.length;
  const unlocked = userAchievements.filter((a) => a.unlockedAt).length;
  return { total, unlocked, percentage: total > 0 ? unlocked / total : 0 };
}

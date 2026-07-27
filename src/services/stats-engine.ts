import { eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { media, watchHistory, episodes } from '@/db/schema';

export interface LibraryStats {
  totalItems: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalEpisodesWatched: number;
  totalHoursWatched: number;
  totalMovies: number;
  totalShows: number;
  totalAnime: number;
  totalBooks: number;
  totalPodcasts: number;
  totalGames: number;
}

export interface GenreStat {
  genre: string;
  count: number;
}

export interface MonthlyActivity {
  month: string;
  count: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWatchDate: string | null;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export function getLibraryStats(): LibraryStats {
  const { db } = getDatabase();
  const allMedia = db.select().from(media).all();

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const m of allMedia) {
    byType[m.mediaType] = (byType[m.mediaType] || 0) + 1;
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
  }

  const totalEpisodesWatched = db
    .select({ count: sql<number>`count(*)` })
    .from(episodes)
    .where(eq(episodes.watched, true))
    .get();

  const watchHistoryRows = db.select().from(watchHistory).all();
  const totalHoursWatched = watchHistoryRows.reduce(
    (sum, w) => sum + ((w.durationMinutes || 0) / 60),
    0,
  );

  return {
    totalItems: allMedia.length,
    byType,
    byStatus,
    totalEpisodesWatched: totalEpisodesWatched?.count || 0,
    totalHoursWatched: Math.round(totalHoursWatched * 10) / 10,
    totalMovies: byType['movie'] || 0,
    totalShows: (byType['tv_show'] || 0) + (byType['anime'] || 0),
    totalAnime: byType['anime'] || 0,
    totalBooks: byType['book'] || 0,
    totalPodcasts: byType['podcast'] || 0,
    totalGames: byType['game'] || 0,
  };
}

export function getGenreDistribution(): GenreStat[] {
  const { db } = getDatabase();
  const allMedia = db.select().from(media).all();
  const genreMap: Record<string, number> = {};

  for (const m of allMedia) {
    if (m.genres) {
      try {
        const genres = JSON.parse(m.genres) as string[];
        for (const g of genres) {
          genreMap[g] = (genreMap[g] || 0) + 1;
        }
      } catch {
        // skip malformed genres
      }
    }
  }

  return Object.entries(genreMap)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export function getMonthlyActivity(months: number = 12): MonthlyActivity[] {
  const { db } = getDatabase();
  const rows = db.select().from(watchHistory).all();

  const monthMap: Record<string, number> = {};
  const now = new Date();

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap[key] = 0;
  }

  for (const w of rows) {
    try {
      const d = new Date(w.watchedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap[key] !== undefined) {
        monthMap[key]++;
      }
    } catch {
      // skip invalid dates
    }
  }

  return Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function getStreakData(): StreakData {
  const { db } = getDatabase();
  const rows = db
    .select({ watchedAt: watchHistory.watchedAt })
    .from(watchHistory)
    .orderBy(sql`${watchHistory.watchedAt} DESC`)
    .all();

  if (rows.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastWatchDate: null };
  }

  const dates = rows.map((r) => r.watchedAt.split('T')[0]);
  const uniqueDates = [...new Set(dates)].sort().reverse();

  let longestStreak = 0;
  let currentStreak: number;
  let tempStreak = 0;
  let lastDate: string | null = null;

  for (const dateStr of uniqueDates) {
    if (!lastDate) {
      lastDate = dateStr;
      tempStreak = 1;
      continue;
    }

    const current = new Date(dateStr);
    const prev = new Date(lastDate);
    const diffDays = Math.round((prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = dateStr;
  }

  currentStreak = tempStreak;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    lastWatchDate: uniqueDates[0] || null,
  };
}

export function getRatingDistribution(): RatingDistribution[] {
  const { db } = getDatabase();
  const rated = db
    .select({ rating: media.personalRating })
    .from(media)
    .where(sql`${media.personalRating} IS NOT NULL`)
    .all();

  const dist: Record<number, number> = {};
  for (const r of rated) {
    const key = Math.floor(r.rating || 0);
    dist[key] = (dist[key] || 0) + 1;
  }

  return Object.entries(dist)
    .map(([rating, count]) => ({ rating: parseInt(rating), count }))
    .sort((a, b) => a.rating - b.rating);
}

export function getTimelineHeatmapData(year?: number): { date: string; count: number }[] {
  const { db } = getDatabase();
  const targetYear = year || new Date().getFullYear();
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;

  const rows = db
    .select({ watchedAt: watchHistory.watchedAt })
    .from(watchHistory)
    .where(sql`${watchHistory.watchedAt} >= ${startDate} AND ${watchHistory.watchedAt} <= ${endDate}`)
    .all();

  const dateMap: Record<string, number> = {};
  for (const r of rows) {
    const d = r.watchedAt.split('T')[0];
    dateMap[d] = (dateMap[d] || 0) + 1;
  }

  return Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

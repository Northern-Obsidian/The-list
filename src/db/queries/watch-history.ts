import { desc, eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { watchHistory } from '@/db/schema/watch-history';

export function getRecentHistory(limit = 10) {
  const { db } = getDatabase();
  return db.select().from(watchHistory).orderBy(desc(watchHistory.watchedAt)).limit(limit).all();
}

export function getHistoryForMedia(mediaId: string) {
  const { db } = getDatabase();
  return db.select().from(watchHistory).where(eq(watchHistory.mediaId, mediaId)).orderBy(desc(watchHistory.watchedAt)).all();
}

export function getHistoryForDate(date: string) {
  const { db } = getDatabase();
  return db.select().from(watchHistory).where(sql`${watchHistory.watchedAt} LIKE ${date + '%'}`).all();
}

export function getHistoryCountByMonth(months = 12) {
  const { db } = getDatabase();
  const rows = db.select({ watchedAt: watchHistory.watchedAt }).from(watchHistory).all();
  const map: Record<string, number> = {};
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    map[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`] = 0;
  }
  for (const r of rows) {
    const d = r.watchedAt.split('T')[0].substring(0, 7);
    if (map[d] !== undefined) map[d]++;
  }
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count }));
}

export function getTotalWatchTime() {
  const { db } = getDatabase();
  const rows = db.select({ duration: watchHistory.durationMinutes }).from(watchHistory).all();
  const totalMinutes = rows.reduce((sum, r) => sum + (r.duration || 0), 0);
  return { totalMinutes, totalHours: Math.round(totalMinutes / 60 * 10) / 10 };
}

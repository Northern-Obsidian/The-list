import { and, desc, eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { media } from '@/db/schema/media';
import type { MediaType, WatchStatus } from '@/types/media';

export function getMediaByType(mediaType: MediaType) {
  const { db } = getDatabase();
  return db.select().from(media).where(eq(media.mediaType, mediaType)).all();
}

export function getMediaByStatus(status: WatchStatus) {
  const { db } = getDatabase();
  return db.select().from(media).where(eq(media.status, status)).all();
}

export function getMediaByTypeAndStatus(mediaType: MediaType, status: WatchStatus) {
  const { db } = getDatabase();
  return db.select().from(media).where(and(eq(media.mediaType, mediaType), eq(media.status, status))).all();
}

export function getFavorites(limit?: number) {
  const { db } = getDatabase();
  const q = db.select().from(media).where(eq(media.favorite, true)).orderBy(desc(media.updatedAt));
  if (limit) q.limit(limit);
  return q.all();
}

export function getInProgress() {
  const { db } = getDatabase();
  return db.select().from(media).where(sql`${media.status} IN ('watching', 'rewatching')`).all();
}

export function getRecentlyUpdated(limit = 10) {
  const { db } = getDatabase();
  return db.select().from(media).orderBy(desc(media.updatedAt)).limit(limit).all();
}

export function getMediaCounts() {
  const { db } = getDatabase();
  const all = db.select().from(media).all();
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let favorites = 0;
  for (const m of all) {
    byType[m.mediaType] = (byType[m.mediaType] || 0) + 1;
    byStatus[m.status] = (byStatus[m.status] || 0) + 1;
    if (m.favorite) favorites++;
  }
  return { total: all.length, byType, byStatus, favorites };
}

export function getMediaById(id: string) {
  const { db } = getDatabase();
  return db.select().from(media).where(eq(media.id, id)).get();
}

export function getMediaByProfile(profileId: string) {
  const { db } = getDatabase();
  return db.select().from(media).where(eq(media.profileId, profileId)).all();
}

export function searchMedia(query: string) {
  const { db } = getDatabase();
  const pattern = `%${query}%`;
  return db
    .select()
    .from(media)
    .where(sql`${media.title} LIKE ${pattern} OR ${media.overview} LIKE ${pattern}`)
    .all();
}

import { eq, sql } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';
import type { MediaType } from '@/types/media';

export interface RecommendationOptions {
  basedOnId?: string;
  genre?: string[];
  mediaType?: MediaType;
  excludeIds?: string[];
  limit?: number;
}

export function getRecommendations(options: RecommendationOptions = {}) {
  const { db, expoDb } = getDatabase();
  const limit = options.limit || 10;
  const excludeIds = options.excludeIds || [];

  let baseItem: typeof media.$inferSelect | undefined;
  if (options.basedOnId) {
    baseItem = db.select().from(media).where(eq(media.id, options.basedOnId)).get();
  }

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (baseItem?.genres) {
    try {
      const genres = JSON.parse(baseItem.genres) as string[];
      if (genres.length > 0) {
        const genreChecks = genres.map(() => `genres LIKE ?`).join(' OR ');
        conditions.push(`(${genreChecks})`);
        genres.forEach((g) => params.push(`%"${g}"%`));
      }
    } catch {}
  }

  if (options.genre && options.genre.length > 0) {
    const genreChecks = options.genre.map(() => `genres LIKE ?`).join(' OR ');
    conditions.push(`(${genreChecks})`);
    options.genre.forEach((g) => params.push(`%"${g}"%`));
  }

  if (options.mediaType) {
    conditions.push(`media_type = ?`);
    params.push(options.mediaType);
  } else if (baseItem) {
    conditions.push(`media_type = ?`);
    params.push(baseItem.mediaType);
  }

  if (excludeIds.length > 0) {
    conditions.push(`id NOT IN (${excludeIds.map(() => '?').join(',')})`);
    params.push(...excludeIds);
  }

  if (baseItem) {
    conditions.push(`id != ?`);
    params.push(baseItem.id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit);
  const results = expoDb.getAllSync(
    `SELECT * FROM media ${whereClause} ORDER BY personal_rating IS NOT NULL DESC, RANDOM() LIMIT ?`,
    ...params,
  );

  return results;
}

export function getSimilarByType(mediaId: string, limit: number = 5) {
  const { db } = getDatabase();
  const item = db.select().from(media).where(eq(media.id, mediaId)).get();
  if (!item) return [];

  return db
    .select()
    .from(media)
    .where(sql`${media.mediaType} = ${item.mediaType} AND ${media.id} != ${mediaId}`)
    .orderBy(sql`RANDOM()`)
    .limit(limit)
    .all();
}

export function getUnwatchedRecommendations(limit: number = 10) {
  const { db } = getDatabase();
  return db
    .select()
    .from(media)
    .where(sql`${media.status} IN ('plan_to_watch', 'paused')`)
    .orderBy(sql`RANDOM()`)
    .limit(limit)
    .all();
}

export function getTopRated(limit: number = 10) {
  const { db } = getDatabase();
  return db
    .select()
    .from(media)
    .where(sql`${media.personalRating} IS NOT NULL`)
    .orderBy(sql`${media.personalRating} DESC`)
    .limit(limit)
    .all();
}

export function getRecentlyAdded(limit: number = 10) {
  const { db } = getDatabase();
  return db
    .select()
    .from(media)
    .orderBy(sql`${media.createdAt} DESC`)
    .limit(limit)
    .all();
}

export function getFavorites(limit: number = 10) {
  const { db } = getDatabase();
  return db
    .select()
    .from(media)
    .where(eq(media.favorite, true))
    .orderBy(sql`RANDOM()`)
    .limit(limit)
    .all();
}

export function getItemsByTypeStatus(type: MediaType, status: string, limit: number = 20) {
  const { db } = getDatabase();
  return db
    .select()
    .from(media)
    .where(sql`${media.mediaType} = ${type} AND ${media.status} = ${status}`)
    .orderBy(sql`${media.updatedAt} DESC`)
    .limit(limit)
    .all();
}

import { sql } from 'drizzle-orm';
import { getDatabase, getActiveProfileId } from '@/db';
import {
  profiles,
  media,
  series,
  seasons,
  episodes,
  collections,
  mediaCollections,
  tags,
  mediaTags,
  watchHistory,
  reviews,
  ratings,
  achievements,
  backups,
  preferences,
} from '@/db/schema';
import { generateId } from '@/utils/generate-id';

export interface BackupData {
  version: string;
  exportedAt: string;
  appVersion: string;
  checksum: string;
  driveFileId?: string | null;
  data: {
    profiles: Record<string, unknown>[];
    media: Record<string, unknown>[];
    series: Record<string, unknown>[];
    seasons: Record<string, unknown>[];
    episodes: Record<string, unknown>[];
    collections: Record<string, unknown>[];
    mediaCollections: Record<string, unknown>[];
    tags: Record<string, unknown>[];
    mediaTags: Record<string, unknown>[];
    watchHistory: Record<string, unknown>[];
    reviews: Record<string, unknown>[];
    ratings: Record<string, unknown>[];
    achievements: Record<string, unknown>[];
    preferences: Record<string, unknown>[];
  };
}

function sha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function exportBackup(): BackupData {
  const { db } = getDatabase();

  const data = {
    profiles: db.select().from(profiles).all(),
    media: db.select().from(media).all(),
    series: db.select().from(series).all(),
    seasons: db.select().from(seasons).all(),
    episodes: db.select().from(episodes).all(),
    collections: db.select().from(collections).all(),
    mediaCollections: db.select().from(mediaCollections).all(),
    tags: db.select().from(tags).all(),
    mediaTags: db.select().from(mediaTags).all(),
    watchHistory: db.select().from(watchHistory).all(),
    reviews: db.select().from(reviews).all(),
    ratings: db.select().from(ratings).all(),
    achievements: db.select().from(achievements).all(),
    preferences: db.select().from(preferences).all(),
  };

  const jsonStr = JSON.stringify(data);
  const checksum = sha256(jsonStr);

  const backup: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    checksum,
    driveFileId: undefined,
    data,
  };

  const { db: db2 } = getDatabase();
  db2.insert(backups)
    .values({
      id: generateId(),
      profileId: getActiveProfileId(),
      version: backup.version,
      fileSize: JSON.stringify(backup).length,
      checksum,
      createdAt: new Date().toISOString(),
    })
    .run();

  return backup;
}

export function importBackup(backup: BackupData): { success: boolean; errors: string[] } {
  const errors: string[] = [];
  const { expoDb } = getDatabase();

  if (!backup || !backup.data) {
    return { success: false, errors: ['Invalid backup data'] };
  }

  if (backup.checksum) {
    const dataStr = JSON.stringify(backup.data);
    const computed = sha256(dataStr);
    if (computed !== backup.checksum) {
      errors.push('Checksum mismatch: data may be corrupted');
    }
  }

  try {
    expoDb.execSync('BEGIN TRANSACTION');

    expoDb.execSync('DELETE FROM watch_history');
    expoDb.execSync('DELETE FROM media_collections');
    expoDb.execSync('DELETE FROM media_tags');
    expoDb.execSync('DELETE FROM reviews');
    expoDb.execSync('DELETE FROM ratings');
    expoDb.execSync('DELETE FROM achievements');
    expoDb.execSync('DELETE FROM backups');
    expoDb.execSync('DELETE FROM preferences');
    expoDb.execSync('DELETE FROM episodes');
    expoDb.execSync('DELETE FROM seasons');
    expoDb.execSync('DELETE FROM series');
    expoDb.execSync('DELETE FROM collections');
    expoDb.execSync('DELETE FROM tags');
    expoDb.execSync('DELETE FROM media');
    expoDb.execSync('DELETE FROM profiles');

    insertBatch('profiles', backup.data.profiles);
    insertBatch('media', backup.data.media);
    insertBatch('series', backup.data.series);
    insertBatch('seasons', backup.data.seasons);
    insertBatch('episodes', backup.data.episodes);
    insertBatch('collections', backup.data.collections);
    insertBatch('media_collections', backup.data.mediaCollections);
    insertBatch('tags', backup.data.tags);
    insertBatch('media_tags', backup.data.mediaTags);
    insertBatch('watch_history', backup.data.watchHistory);
    insertBatch('reviews', backup.data.reviews);
    insertBatch('ratings', backup.data.ratings);
    insertBatch('achievements', backup.data.achievements);
    insertBatch('preferences', backup.data.preferences);

    expoDb.execSync('COMMIT');
    return { success: true, errors };
  } catch (err) {
    expoDb.execSync('ROLLBACK');
    errors.push(err instanceof Error ? err.message : 'Unknown error during import');
    return { success: false, errors };
  }
}

function insertBatch(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const { expoDb } = getDatabase();
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(',');
  const stmt = expoDb.prepareSync(
    `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`,
  );

  for (const row of rows) {
    stmt.executeSync(...columns.map((c) => (row[c] as string | number | null ?? null)));
  }
}

export function getBackupHistory(limit: number = 10) {
  const { db } = getDatabase();
  return db.select().from(backups).orderBy(sql`created_at DESC`).limit(limit).all();
}

export function exportToJsonString(): string {
  const backup = exportBackup();
  return JSON.stringify(backup, null, 2);
}

export function getBackupSize(): number {
  const backup = exportBackup();
  return JSON.stringify(backup).length;
}

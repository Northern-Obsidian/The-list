import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { media } from '@/db/schema';
import type { MediaType, WatchStatus } from '@/types/media';

export interface RandomPickOptions {
  mediaType?: MediaType | MediaType[];
  status?: WatchStatus | WatchStatus[];
  favorite?: boolean;
  hasRating?: boolean;
  hasReview?: boolean;
  notInStatus?: WatchStatus[];
}

export function pickRandom(options: RandomPickOptions = {}) {
  const { db } = getDatabase();
  let items = db.select().from(media).all();

  if (options.mediaType) {
    const types = Array.isArray(options.mediaType) ? options.mediaType : [options.mediaType];
    items = items.filter((m) => types.includes(m.mediaType as MediaType));
  }

  if (options.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    items = items.filter((m) => statuses.includes(m.status as WatchStatus));
  }

  if (options.favorite) {
    items = items.filter((m) => m.favorite);
  }

  if (options.hasRating) {
    items = items.filter((m) => m.personalRating != null);
  }

  if (options.notInStatus) {
    const statuses = Array.isArray(options.notInStatus) ? options.notInStatus : [options.notInStatus];
    items = items.filter((m) => !statuses.includes(m.status as WatchStatus));
  }

  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomFromIds(ids: string[]) {
  if (ids.length === 0) return null;
  const pick = ids[Math.floor(Math.random() * ids.length)];
  const { db } = getDatabase();
  return db.select().from(media).where(eq(media.id, pick)).get();
}

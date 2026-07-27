import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { tags, mediaTags } from '@/db/schema/tags';

export function getAllTags() {
  const { db } = getDatabase();
  return db.select().from(tags).all();
}

export function getTagById(id: string) {
  const { db } = getDatabase();
  return db.select().from(tags).where(eq(tags.id, id)).get();
}

export function getTagsForMedia(mediaId: string) {
  const { db } = getDatabase();
  const joins = db.select().from(mediaTags).where(eq(mediaTags.mediaId, mediaId)).all();
  if (joins.length === 0) return [];
  const tagIds = joins.map((j) => j.tagId);
  return db.select().from(tags).all().filter((t) => tagIds.includes(t.id));
}

export function getMediaIdsForTag(tagId: string) {
  const { db } = getDatabase();
  return db.select().from(mediaTags).where(eq(mediaTags.tagId, tagId)).all().map((j) => j.mediaId);
}

export function getTagCounts() {
  const { db } = getDatabase();
  const allTags = db.select().from(tags).all();
  const allJoins = db.select().from(mediaTags).all();
  return allTags.map((t) => ({
    ...t,
    count: allJoins.filter((j) => j.tagId === t.id).length,
  }));
}

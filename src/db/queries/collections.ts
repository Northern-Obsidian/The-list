import { eq } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { collections, mediaCollections } from '@/db/schema/collections';

export function getAllCollections() {
  const { db } = getDatabase();
  return db.select().from(collections).all();
}

export function getCollectionById(id: string) {
  const { db } = getDatabase();
  return db.select().from(collections).where(eq(collections.id, id)).get();
}

export function getCollectionsForMedia(mediaId: string) {
  const { db } = getDatabase();
  const joins = db.select().from(mediaCollections).where(eq(mediaCollections.mediaId, mediaId)).all();
  if (joins.length === 0) return [];
  const collectionIds = joins.map((j) => j.collectionId);
  return db.select().from(collections).all().filter((c) => collectionIds.includes(c.id));
}

export function getMediaIdsForCollection(collectionId: string) {
  const { db } = getDatabase();
  return db.select().from(mediaCollections).where(eq(mediaCollections.collectionId, collectionId)).all().map((j) => j.mediaId);
}

export function getCollectionsWithCounts() {
  const { db } = getDatabase();
  const all = db.select().from(collections).all();
  const allJoins = db.select().from(mediaCollections).all();
  return all.map((c) => ({
    ...c,
    itemCount: allJoins.filter((j) => j.collectionId === c.id).length,
  }));
}

export function getSmartCollections() {
  const { db } = getDatabase();
  return db.select().from(collections).where(eq(collections.isSmart, true)).all();
}

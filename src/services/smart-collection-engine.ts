import type { SmartRules, SmartRule } from '@/types/collections';
import { getDatabase } from '@/db';
import { media, mediaCollections, collections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function evaluateRule(item: typeof media.$inferSelect, rule: SmartRule): boolean {
  const fieldValue = (() => {
    switch (rule.field) {
      case 'mediaType': return item.mediaType;
      case 'status': return item.status;
      case 'year': return item.year;
      case 'rating': return item.personalRating;
      case 'genre': return item.genres ? JSON.parse(item.genres) as string[] : [];
      case 'director': return item.director || '';
      case 'studio': return item.studio || '';
    }
  })();

  switch (rule.operator) {
    case 'equals':
      return String(fieldValue).toLowerCase() === rule.value.toLowerCase();
    case 'not_equals':
      return String(fieldValue).toLowerCase() !== rule.value.toLowerCase();
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > Number(rule.value);
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < Number(rule.value);
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) => v.toLowerCase().includes(rule.value.toLowerCase()));
      }
      return String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
    case 'not_contains':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.some((v) => v.toLowerCase().includes(rule.value.toLowerCase()));
      }
      return !String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
    case 'between':
      if (typeof fieldValue === 'number') {
        return fieldValue >= Number(rule.value) && fieldValue <= Number(rule.value2 || rule.value);
      }
      return false;
    case 'is_empty':
      return fieldValue === null || fieldValue === undefined || fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'is_not_empty':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '' &&
        (!Array.isArray(fieldValue) || fieldValue.length > 0);
  }
}

export function evaluateSmartRules(item: typeof media.$inferSelect, rules: SmartRules): boolean {
  if (rules.rules.length === 0) return true;
  if (rules.group === 'all') {
    return rules.rules.every((rule) => evaluateRule(item, rule));
  }
  return rules.rules.some((rule) => evaluateRule(item, rule));
}

export function getSmartCollectionMedia(collectionId: string): typeof media.$inferSelect[] {
  const { db } = getDatabase();
  const col = db.select().from(collections).where(eq(collections.id, collectionId)).get();
  if (!col || !col.isSmart || !col.smartRules) return [];

  const rules: SmartRules = JSON.parse(col.smartRules);
  const allMedia = db.select().from(media).all();
  return allMedia.filter((item) => evaluateSmartRules(item, rules));
}

export function refreshAllSmartCollections(): void {
  const { db } = getDatabase();
  const allCols = db.select().from(collections).all();
  const smartCols = allCols.filter((c) => c.isSmart);

  for (const col of smartCols) {
    if (!col.smartRules) continue;
    const matchedIds = getSmartCollectionMedia(col.id).map((m) => m.id);

    const existingLinks = db
      .select()
      .from(mediaCollections)
      .where(eq(mediaCollections.collectionId, col.id))
      .all();
    const existingIds = new Set(existingLinks.map((l) => l.mediaId));

    for (const mediaId of matchedIds) {
      if (!existingIds.has(mediaId)) {
        db.insert(mediaCollections)
          .values({ mediaId, collectionId: col.id, addedAt: new Date().toISOString() })
          .run();
      }
    }

    for (const link of existingLinks) {
      if (!matchedIds.includes(link.mediaId)) {
        db.delete(mediaCollections)
          .where(
            and(
              eq(mediaCollections.mediaId, link.mediaId),
              eq(mediaCollections.collectionId, col.id),
            ),
          )
          .run();
      }
    }
  }
}

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';
import { media } from './media';

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  coverPath: text('cover_path'),
  color: text('color'),
  icon: text('icon'),
  isSmart: integer('is_smart', { mode: 'boolean' }).default(false),
  smartRules: text('smart_rules'),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const mediaCollections = sqliteTable('media_collections', {
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  addedAt: text('added_at').notNull(),
});

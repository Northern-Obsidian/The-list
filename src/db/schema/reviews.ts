import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { media } from './media';
import { profiles } from './profiles';

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull(),
  isSpoiler: integer('is_spoiler', { mode: 'boolean' }).default(false),
  favoriteScene: text('favorite_scene'),
  quotes: text('quotes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

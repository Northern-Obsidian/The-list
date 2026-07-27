import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';
import { media } from './media';

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#888888'),
});

export const mediaTags = sqliteTable('media_tags', {
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

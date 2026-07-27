import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
import { media } from './media';
import { profiles } from './profiles';

export const ratings = sqliteTable('ratings', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  score: real('score').notNull(),
  heart: integer('heart', { mode: 'boolean' }).default(false),
  thumbsUp: integer('thumbs_up', { mode: 'boolean' }).default(false),
  masterpiece: integer('masterpiece', { mode: 'boolean' }).default(false),
  needRewatch: integer('need_rewatch', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

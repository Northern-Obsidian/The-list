import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  unlockedAt: text('unlocked_at'),
  progressCurrent: integer('progress_current').default(0),
  progressTarget: integer('progress_target'),
  isSecret: integer('is_secret', { mode: 'boolean' }).default(false),
});

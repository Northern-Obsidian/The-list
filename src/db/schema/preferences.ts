import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';

export const preferences = sqliteTable('preferences', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: text('value').notNull(),
});

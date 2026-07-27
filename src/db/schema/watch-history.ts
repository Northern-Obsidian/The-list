import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { media } from './media';
import { episodes } from './episodes';
import { profiles } from './profiles';

export const watchHistory = sqliteTable('watch_history', {
  id: text('id').primaryKey(),
  mediaId: text('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  episodeId: text('episode_id').references(() => episodes.id, { onDelete: 'set null' }),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  watchedAt: text('watched_at').notNull(),
  durationMinutes: integer('duration_minutes'),
  note: text('note'),
  watchedWith: text('watched_with'),
  mood: text('mood'),
  platform: text('platform'),
  device: text('device'),
}, (table) => [
  index('idx_watch_history_media').on(table.mediaId),
  index('idx_watch_history_profile').on(table.profileId),
  index('idx_watch_history_date').on(table.watchedAt),
]);

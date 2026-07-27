import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { series } from './series';

export const seasons = sqliteTable('seasons', {
  id: text('id').primaryKey(),
  seriesId: text('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  seasonNumber: integer('season_number').notNull(),
  episodeCount: integer('episode_count').default(0),
  completedEpisodes: integer('completed_episodes').default(0),
  title: text('title'),
  overview: text('overview'),
  posterPath: text('poster_path'),
  airDate: text('air_date'),
  isFiller: integer('is_filler', { mode: 'boolean' }).default(false),
}, (table) => [
  uniqueIndex('unq_seasons_series_season').on(table.seriesId, table.seasonNumber),
]);

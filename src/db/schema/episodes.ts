import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { series } from './series';
import { seasons } from './seasons';

export const episodes = sqliteTable('episodes', {
  id: text('id').primaryKey(),
  seriesId: text('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  seasonId: text('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  episodeNumber: integer('episode_number').notNull(),
  title: text('title'),
  overview: text('overview'),
  runtime: integer('runtime'),
  airDate: text('air_date'),
  stillPath: text('still_path'),
  watched: integer('watched', { mode: 'boolean' }).default(false),
  watchDate: text('watch_date'),
  personalRating: real('personal_rating'),
  notes: text('notes'),
  favorite: integer('favorite', { mode: 'boolean' }).default(false),
  isFiller: integer('is_filler', { mode: 'boolean' }).default(false),
  isSpecial: integer('is_special', { mode: 'boolean' }).default(false),
  isRecap: integer('is_recap', { mode: 'boolean' }).default(false),
}, (table) => ({
  idxEpisodesSeries: index('idx_episodes_series').on(table.seriesId),
  idxEpisodesSeason: index('idx_episodes_season').on(table.seasonId),
  idxEpisodesWatched: index('idx_episodes_watched').on(table.watched),
}));

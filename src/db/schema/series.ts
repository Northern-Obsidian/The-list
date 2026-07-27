import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { media } from './media';

export const series = sqliteTable('series', {
  id: text('id').primaryKey().references(() => media.id, { onDelete: 'cascade' }),
  totalSeasons: integer('total_seasons').default(0),
  totalEpisodes: integer('total_episodes').default(0),
  completedEpisodes: integer('completed_episodes').default(0),
  currentSeason: integer('current_season').default(1),
  currentEpisode: integer('current_episode').default(0),
  airStatus: text('air_status', { enum: ['airing', 'completed', 'upcoming'] }),
  startDate: text('start_date'),
  endDate: text('end_date'),
  nextEpisodeDate: text('next_episode_date'),
});

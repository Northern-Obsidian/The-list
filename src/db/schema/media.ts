import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { profiles } from './profiles';

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  mediaType: text('media_type', {
    enum: ['movie', 'tv_show', 'anime', 'documentary', 'web_series', 'mini_series', 'ova', 'cartoon', 'reality_show', 'podcast', 'audiobook', 'book', 'game', 'drama'],
  }).notNull(),
  title: text('title').notNull(),
  originalTitle: text('original_title'),
  sortTitle: text('sort_title'),
  overview: text('overview'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  runtime: integer('runtime'),
  year: integer('year'),
  genres: text('genres'),
  studio: text('studio'),
  country: text('country'),
  language: text('language'),
  director: text('director'),
  actors: text('actors'),
  status: text('status', {
    enum: ['plan_to_watch', 'watching', 'completed', 'paused', 'dropped', 'rewatching'],
  }).notNull().default('plan_to_watch'),
  personalRating: real('personal_rating'),
  favorite: integer('favorite', { mode: 'boolean' }).default(false),
  rewatchCount: integer('rewatch_count').default(0),
  notes: text('notes'),
  tags: text('tags'),
  collectionIds: text('collection_ids'),
  importedFrom: text('imported_from'),
  customFields: text('custom_fields'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('idx_media_profile').on(table.profileId),
  index('idx_media_type').on(table.mediaType),
  index('idx_media_status').on(table.status),
  index('idx_media_title').on(table.title),
  index('idx_media_year').on(table.year),
]);

import { and, eq } from 'drizzle-orm';
import { getDatabase } from '@/db';
import { series } from '@/db/schema/series';
import { seasons } from '@/db/schema/seasons';
import { episodes } from '@/db/schema/episodes';

export function getSeriesById(id: string) {
  const { db } = getDatabase();
  return db.select().from(series).where(eq(series.id, id)).get();
}

export function getSeasonsForSeries(seriesId: string) {
  const { db } = getDatabase();
  return db.select().from(seasons).where(eq(seasons.seriesId, seriesId)).orderBy(seasons.seasonNumber).all();
}

export function getEpisodesForSeason(seasonId: string) {
  const { db } = getDatabase();
  return db.select().from(episodes).where(eq(episodes.seasonId, seasonId)).orderBy(episodes.episodeNumber).all();
}

export function getUnwatchedEpisodesForSeason(seasonId: string) {
  const { db } = getDatabase();
  return db.select().from(episodes).where(and(eq(episodes.seasonId, seasonId), eq(episodes.watched, false))).all();
}

export function getEpisodeById(id: string) {
  const { db } = getDatabase();
  return db.select().from(episodes).where(eq(episodes.id, id)).get();
}

export function getSeriesProgress(seriesId: string) {
  const { db } = getDatabase();
  const s = db.select().from(series).where(eq(series.id, seriesId)).get();
  if (!s) return null;
  const allEps = db.select().from(episodes).where(eq(episodes.seriesId, seriesId)).all();
  const watched = allEps.filter((e) => e.watched).length;
  return {
    series: s,
    totalEpisodes: allEps.length,
    watchedEpisodes: watched,
    progress: allEps.length > 0 ? Math.round((watched / allEps.length) * 100) : 0,
  };
}

export function markEpisodeWatched(episodeId: string, watchDate: string) {
  const { db } = getDatabase();
  db.update(episodes)
    .set({ watched: true, watchDate })
    .where(eq(episodes.id, episodeId))
    .run();
}

export function markEpisodeUnwatched(episodeId: string) {
  const { db } = getDatabase();
  db.update(episodes)
    .set({ watched: false, watchDate: null })
    .where(eq(episodes.id, episodeId))
    .run();
}

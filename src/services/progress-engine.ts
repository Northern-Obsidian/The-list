import { eq, and, asc, inArray } from 'drizzle-orm';
import { getDatabase, getActiveProfileId } from '@/db';
import { media, series, seasons, episodes, watchHistory } from '@/db/schema';
import { generateId } from '@/utils/generate-id';

export interface SeriesProgress {
  totalSeasons: number;
  totalEpisodes: number;
  completedEpisodes: number;
  currentSeason: number;
  currentEpisode: number;
  percentage: number;
  airStatus: string | null;
  nextEpisodeDate: string | null;
}

export interface SeasonProgress {
  seasonId: string;
  seasonNumber: number;
  episodeCount: number;
  completedEpisodes: number;
  percentage: number;
  title: string | null;
}

export interface EpisodeItem {
  id: string;
  episodeNumber: number;
  title: string | null;
  overview: string | null;
  runtime: number | null;
  airDate: string | null;
  watched: boolean;
  watchDate: string | null;
  personalRating: number | null;
  notes: string | null;
  favorite: boolean;
  isFiller: boolean;
  isSpecial: boolean;
  isRecap: boolean;
}

export function getSeriesProgress(seriesId: string): SeriesProgress | null {
  const { db } = getDatabase();
  const s = db.select().from(series).where(eq(series.id, seriesId)).get();
  if (!s) return null;

  const total = s.totalEpisodes || 0;
  const completed = s.completedEpisodes || 0;

  return {
    totalSeasons: s.totalSeasons || 0,
    totalEpisodes: total,
    completedEpisodes: completed,
    currentSeason: s.currentSeason || 1,
    currentEpisode: s.currentEpisode || 0,
    percentage: total > 0 ? completed / total : 0,
    airStatus: s.airStatus,
    nextEpisodeDate: s.nextEpisodeDate,
  };
}

export function getSeasonsWithProgress(seriesId: string): SeasonProgress[] {
  const { db } = getDatabase();
  const rows = db
    .select()
    .from(seasons)
    .where(eq(seasons.seriesId, seriesId))
    .orderBy(asc(seasons.seasonNumber))
    .all();

  return rows.map((s) => ({
    seasonId: s.id,
    seasonNumber: s.seasonNumber,
    episodeCount: s.episodeCount || 0,
    completedEpisodes: s.completedEpisodes || 0,
    percentage: (s.episodeCount || 0) > 0 ? (s.completedEpisodes || 0) / (s.episodeCount || 0) : 0,
    title: s.title,
  }));
}

export function getEpisodes(seasonId: string): EpisodeItem[] {
  const { db } = getDatabase();
  return db
    .select()
    .from(episodes)
    .where(eq(episodes.seasonId, seasonId))
    .orderBy(asc(episodes.episodeNumber))
    .all()
    .map((e) => ({
      id: e.id,
      episodeNumber: e.episodeNumber,
      title: e.title,
      overview: e.overview,
      runtime: e.runtime,
      airDate: e.airDate,
      watched: e.watched ?? false,
      watchDate: e.watchDate,
      personalRating: e.personalRating,
      notes: e.notes,
      favorite: e.favorite ?? false,
      isFiller: e.isFiller ?? false,
      isSpecial: e.isSpecial ?? false,
      isRecap: e.isRecap ?? false,
    }));
}

export function getEpisodeDetail(episodeId: string): EpisodeItem | null {
  const { db } = getDatabase();
  const e = db.select().from(episodes).where(eq(episodes.id, episodeId)).get();
  if (!e) return null;
  return {
    id: e.id,
    episodeNumber: e.episodeNumber,
    title: e.title,
    overview: e.overview,
    runtime: e.runtime,
    airDate: e.airDate,
    watched: e.watched ?? false,
    watchDate: e.watchDate,
    personalRating: e.personalRating,
    notes: e.notes,
    favorite: e.favorite ?? false,
    isFiller: e.isFiller ?? false,
    isSpecial: e.isSpecial ?? false,
    isRecap: e.isRecap ?? false,
  };
}

export function getNextUnwatchedEpisode(seriesId: string): { seasonId: string; episodeId: string; episodeNumber: number } | null {
  const { db } = getDatabase();
  const se = db
    .select()
    .from(seasons)
    .where(eq(seasons.seriesId, seriesId))
    .orderBy(asc(seasons.seasonNumber))
    .all();

  for (const s of se) {
    const ep = db
      .select()
      .from(episodes)
      .where(and(eq(episodes.seasonId, s.id), eq(episodes.watched, false)))
      .orderBy(asc(episodes.episodeNumber))
      .get();
    if (ep) {
      return { seasonId: s.id, episodeId: ep.id, episodeNumber: ep.episodeNumber };
    }
  }
  return null;
}

export function markEpisodeWatched(
  episodeId: string,
  profileId?: string,
  options?: { rating?: number; notes?: string; watchedAt?: string },
) {
  profileId = profileId || getActiveProfileId();
  const { db } = getDatabase();
  const now = options?.watchedAt || new Date().toISOString();

  const ep = db.select().from(episodes).where(eq(episodes.id, episodeId)).get();
  if (!ep) return;

  db.update(episodes)
    .set({ watched: true, watchDate: now, personalRating: options?.rating ?? ep.personalRating, notes: options?.notes ?? ep.notes })
    .where(eq(episodes.id, episodeId))
    .run();

  db.insert(watchHistory)
    .values({
      id: generateId(),
      mediaId: ep.seriesId,
      episodeId: episodeId,
      profileId,
      watchedAt: now,
      durationMinutes: ep.runtime || undefined,
    })
    .run();

  recalculateSeasonProgress(ep.seasonId);
  recalculateSeriesProgress(ep.seriesId);
}

export function markEpisodeUnwatched(episodeId: string) {
  const { db } = getDatabase();
  const ep = db.select().from(episodes).where(eq(episodes.id, episodeId)).get();
  if (!ep) return;

  db.update(episodes)
    .set({ watched: false, watchDate: null })
    .where(eq(episodes.id, episodeId))
    .run();

  db.delete(watchHistory)
    .where(and(eq(watchHistory.episodeId, episodeId)))
    .run();

  recalculateSeasonProgress(ep.seasonId);
  recalculateSeriesProgress(ep.seriesId);
}

export function markAllEpisodesInSeason(seasonId: string, watched: boolean, profileId?: string) {
  const { db } = getDatabase();
  profileId = profileId || getActiveProfileId();
  const eps = db.select().from(episodes).where(eq(episodes.seasonId, seasonId)).all();

  for (const ep of eps) {
    if (watched && !ep.watched) {
      markEpisodeWatched(ep.id, profileId);
    } else if (!watched && ep.watched) {
      markEpisodeUnwatched(ep.id);
    }
  }
}

export function updateEpisodeRating(episodeId: string, rating: number | null) {
  const { db } = getDatabase();
  db.update(episodes).set({ personalRating: rating }).where(eq(episodes.id, episodeId)).run();
}

export function updateEpisodeNotes(episodeId: string, notes: string | null) {
  const { db } = getDatabase();
  db.update(episodes).set({ notes }).where(eq(episodes.id, episodeId)).run();
}

export function toggleEpisodeFavorite(episodeId: string) {
  const { db } = getDatabase();
  const ep = db.select().from(episodes).where(eq(episodes.id, episodeId)).get();
  if (ep) {
    db.update(episodes).set({ favorite: ep.favorite ? false : true }).where(eq(episodes.id, episodeId)).run();
  }
}

function recalculateSeasonProgress(seasonId: string) {
  const { db } = getDatabase();
  const eps = db.select().from(episodes).where(eq(episodes.seasonId, seasonId)).all();
  const completed = eps.filter((e) => e.watched).length;
  db.update(seasons).set({ completedEpisodes: completed }).where(eq(seasons.id, seasonId)).run();
}

function recalculateSeriesProgress(seriesId: string) {
  const { db } = getDatabase();
  const s = db.select().from(series).where(eq(series.id, seriesId)).get();
  if (!s) return;

  const allSeasons = db.select().from(seasons).where(eq(seasons.seriesId, seriesId)).all();
  const completed = allSeasons.reduce((sum, s) => sum + (s.completedEpisodes || 0), 0);

  db.update(series).set({ completedEpisodes: completed }).where(eq(series.id, seriesId)).run();
}

export function getContinueWatchingSeries(limit: number = 5) {
  const { db } = getDatabase();
  const rows = db
    .select()
    .from(series)
    .innerJoin(media, eq(series.id, media.id))
    .where(
      and(
        eq(media.status, 'watching'),
        inArray(series.airStatus, ['airing', 'completed'] as const),
      ),
    )
    .orderBy(media.updatedAt)
    .limit(limit)
    .all();

  return rows.map((r) => ({
    ...r.media,
    ...r.series,
    progress: (r.series.completedEpisodes || 0) / (r.series.totalEpisodes || 1),
  }));
}

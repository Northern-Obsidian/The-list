export const MEDIA_TYPES = [
  'movie', 'tv_show', 'anime', 'documentary', 'web_series',
  'mini_series', 'ova', 'cartoon', 'reality_show',
  'podcast', 'audiobook', 'book', 'game', 'drama',
] as const;

export type MediaType = (typeof MEDIA_TYPES)[number];

export const SERIES_TYPES: readonly MediaType[] = [
  'tv_show', 'anime', 'web_series', 'mini_series', 'ova', 'cartoon', 'reality_show',
];

export const HAS_SEASONS: ReadonlySet<MediaType> = new Set(SERIES_TYPES);

export const WATCH_STATUSES = [
  'plan_to_watch', 'watching', 'completed',
  'paused', 'dropped', 'rewatching',
] as const;

export type WatchStatus = (typeof WATCH_STATUSES)[number];

export interface RatingData {
  score?: number;
  heart: boolean;
  thumbsUp: boolean;
  masterpiece: boolean;
  needRewatch: boolean;
}

export interface MediaFormData {
  id?: string;
  title: string;
  mediaType: MediaType;
  originalTitle?: string;
  status: WatchStatus;
  overview?: string;
  year?: number;
  runtime?: number;
  genres?: string[];
  studio?: string;
  country?: string;
  language?: string;
  director?: string[];
  actors?: string[];
  personalRating?: number;
  favorite: boolean;
  notes?: string;
  totalSeasons?: number;
  totalEpisodes?: number;
  airStatus?: string;
  rating?: RatingData;
}

import type { SmartRules } from '@/types/collections';

export interface CollectionFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isSmart: boolean;
  smartRules?: SmartRules;
}

export interface ReviewFormData {
  title?: string;
  content: string;
  isSpoiler: boolean;
  favoriteScene?: string;
  quotes?: string;
}

export interface ProfileFormData {
  name: string;
  avatar?: string;
  isGuest: boolean;
}

export interface EpisodeFormData {
  episodeNumber: number;
  title?: string;
  overview?: string;
  runtime?: number;
  watched: boolean;
  isFiller: boolean;
  isSpecial: boolean;
}

export interface SeasonFormData {
  seasonNumber: number;
  title?: string;
  overview?: string;
  episodeCount: number;
  isFiller: boolean;
}

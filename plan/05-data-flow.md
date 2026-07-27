# Data Flow & State Management

## State Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Components                │
│                                                 │
│  ┌─────────────┐   ┌───────────────────────┐   │
│  │  Screens    │   │   Reusable Components  │   │
│  └──────┬──────┘   └───────────┬───────────┘   │
│         │                      │               │
│  ┌──────▼──────────────────────▼───────────┐   │
│  │           Custom Hooks                   │   │
│  │  use-media.ts, use-series.ts, etc.       │   │
│  └──────┬──────────────────────┬───────────┘   │
│         │                      │               │
│  ┌──────▼─────┐   ┌───────────▼───────────┐   │
│  │   Stores   │   │  Direct DB Queries     │   │
│  │ (Context)  │   │  (Drizzle ORM)         │   │
│  └──────┬─────┘   └───────────┬───────────┘   │
│         │                      │               │
│  ┌──────▼──────────────────────▼───────────┐   │
│  │            SQLite Database               │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Data Flow Paradigm

**No external state management library.** The app uses:
1. **React Context** for global concerns (theme, active profile, preferences)
2. **Custom hooks** for data access patterns (wrapping Drizzle queries)
3. **Synchronous DB access** for offline-first reliability (no async overhead for reads when possible)

This avoids the complexity of Redux/Zustand for an offline-first app where data is always local.

## Context Providers

### DatabaseProvider
```typescript
// Provides SQLite database connection to the tree
// Initializes DB, runs migrations
// Makes drizzle instance available via context
const DatabaseContext = createContext<DrizzleDb | null>(null);
```

### ProfileProvider
```typescript
// Manages active profile
// Handles profile switching
// Provides current profile ID to all queries
const ProfileContext = createContext<{
  activeProfile: Profile | null;
  profiles: Profile[];
  switchProfile: (id: string) => void;
  addProfile: (profile: NewProfile) => void;
  deleteProfile: (id: string) => void;
}>();
```

### ThemeProvider (already from expo-router)
Extended with custom themes beyond dark/light:
- Dark, AMOLED, Light, Glass, Cyberpunk, Neon, Minimal
- Material You dynamic colors on Android
- Persisted to MMKV

## Custom Hook Pattern

Every data access hook follows this pattern:

```typescript
// use-media.ts
function useMedia(id: string) {
  const db = useDb();
  const profile = useProfile();

  return useMemo(() => {
    if (!db || !profile) return null;
    return db.query.media.findFirst({
      where: and(
        eq(media.id, id),
        eq(media.profileId, profile.id)
      ),
      with: {
        rating: true,
        review: true,
        tags: true,
        collections: true,
      }
    });
  }, [db, profile, id]);
}

function useMediaList(filters?: MediaFilters) {
  const db = useDb();
  const profile = useProfile();

  // Returns sorted, filtered, paginated results
  return useMemo(() => {
    if (!db || !profile) return [];
    return buildMediaQuery(db, profile.id, filters);
  }, [db, profile, filters]);
}
```

## Data Writing Pattern

All writes go through store-like functions that:
1. Update the database immediately (sync)
2. Return the updated data
3. React components re-render via dependency changes

```typescript
// Example: marking an episode as watched
function useMarkEpisodeWatched() {
  const db = useDb();
  const profile = useProfile();

  return useCallback((episodeId: string) => {
    const now = new Date().toISOString();
    
    // Update episode
    db.update(episodes)
      .set({ watched: 1, watchDate: now })
      .where(eq(episodes.id, episodeId))
      .run();

    // Record in watch history
    db.insert(watchHistory).values({
      id: generateId(),
      episodeId,
      profileId: profile.id,
      watchedAt: now,
    }).run();

    // Recalculate series progress
    recalculateProgress(db, episodeId);

    // Check achievements
    checkAchievements(db, profile.id);
  }, [db, profile]);
}
```

## Reactivity Strategy

Since SQLite queries are synchronous in expo-sqlite, we can:
1. Store data in local state via `useMemo`/`useState`
2. Trigger re-renders by forcing state updates after writes
3. Use `useSyncExternalStore` for reactive subscriptions to DB changes

```typescript
// Simple reactive store pattern
function createDBStore<T>(query: () => T) {
  const listeners = new Set<() => void>();
  let value = query();

  return {
    getValue: () => value,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh: () => {
      value = query();
      listeners.forEach(fn => fn());
    },
  };
}
```

## Search Flow

```
User types in SearchBar
        │
        ▼
Debounce 300ms
        │
        ▼
Build SQL query with LIKE clauses
  - title (NOCASE)
  - genres (LIKE)
  - studio (NOCASE)
  - director (NOCASE)
  - actors (NOCASE)
  - year (exact match)
        │
        ▼
Execute query with LIMIT + OFFSET
        │
        ▼
Update SearchResults component
```

## Progress Engine

The universal progress engine handles multiple media types:

```typescript
interface ProgressResult {
  total: number;
  completed: number;
  percentage: number;
  currentSeason: number;
  currentEpisode: number;
  remaining: number;
  nextEpisode: { season: number; episode: number } | null;
  status: 'not_started' | 'in_progress' | 'complete';
}

function calculateProgress(mediaType: string, series?: SeriesData): ProgressResult {
  switch (mediaType) {
    case 'movie':
      // Single item, binary watched/unwatched
      return { total: 1, completed: watched ? 1 : 0, ... };
    case 'tv_show':
    case 'anime':
      // Sum across all seasons and episodes
      // Respect filler/special flags?
    case 'podcast':
      // Track by episodes
  }
}

function markNextAsWatched(current: ProgressResult): ProgressResult {
  // Auto-advance to next episode
  // Handle season boundaries
  // Handle series completion
}
```

## Statistics Engine

All statistics computed from raw data:

```typescript
function computeStats(profileId: string): FullStats {
  const allMedia = getMediaWithHistory(profileId);
  
  return {
    totals: {
      movies: countByType(allMedia, 'movie'),
      shows: countByType(allMedia, 'tv_show'),
      anime: countByType(allMedia, 'anime'),
      // ...
    },
    status: {
      watching: countByStatus(allMedia, 'watching'),
      completed: countByStatus(allMedia, 'completed'),
      paused: countByStatus(allMedia, 'paused'),
      // ...
    },
    time: {
      totalHours: sumRuntime(allMedia),
      daysWatched: calculateDays(allMedia),
      averageMovieLength: avgMovieRuntime(allMedia),
      longestMovie: maxMovieRuntime(allMedia),
      averageEpisodesPerDay: avgEpisodesPerDay(allMedia),
    },
    streaks: {
      longest: calculateLongestStreak(allMedia),
      current: calculateCurrentStreak(allMedia),
    },
    favorites: {
      mostWatchedGenre: topGenre(allMedia),
      favoriteActor: topActor(allMedia),
      favoriteDirector: topDirector(allMedia),
      favoriteStudio: topStudio(allMedia),
    },
    ratings: {
      average: avgRating(allMedia),
      distribution: ratingDistribution(allMedia),
    },
    genres: genrePercentages(allMedia),
  };
}
```

## Achievement Engine

Achievements are checked after every data mutation:

```typescript
const ACHIEVEMENTS = {
  FIRST_MOVIE:        { check: (s) => s.totals.movies >= 1 },
  MOVIE_MANIA:        { check: (s) => s.totals.movies >= 100 },
  THOUSAND_EPISODES:  { check: (s) => s.totals.episodes >= 1000 },
  WEEKEND_WARRIOR:    { check: (s) => hasStreakOnDay(s, 'Saturday') || hasStreakOnDay(s, 'Sunday') },
  ANIME_MASTER:       { check: (s) => s.totals.anime >= 50 },
  BINGE_KING:         { check: (s) => longestBinge(s) >= 8 }, // 8+ hours
  NIGHT_OWL:          { check: (s) => mostActiveHour(s) >= 0 && mostActiveHour(s) <= 5 },
  SERIES_ADDICT:      { check: (s) => s.totals.shows >= 50 },
};
```

## Memory Capsule Flow

```
User watches episode
        │
        ▼
Mark as watched
        │
        ▼
Optional: Memory Capsule prompt
  ├── Skip (watch history recorded with just timestamp)
  └── Fill in:
      ├── Note: "Watched with friends, couldn't stop laughing"
      ├── Mood: "Happy"
      ├── Platform: "Netflix"
      ├── Device: "TV"
      └── Watched With: "Sarah, Mike"
        │
        ▼
Saved to watch_history table
        │
        ▼
Displayed in Recent Activity, Calendar, Timeline
```

## Data Export/Import Flow

### Export
```
User taps Export
        │
        ▼
Select format: JSON / CSV / Markdown / PDF
        │
        ▼
Query all data for active profile
        │
        ▼
Transform to selected format
  ├── JSON: All tables as structured JSON
  ├── CSV: Each table type as separate CSV
  ├── Markdown: Human-readable formatted report
  └── PDF: Rich formatted document with stats
        │
        ▼
Write to temp file
        │
        ▼
Share sheet (system UI)
```

### Import
```
User taps Import
        │
        ▼
File picker (JSON / CSV)
        │
        ▼
Validate schema with Zod
        │
        ▼
Dry run: preview changes
  ├── New items to add
  ├── Existing items to skip/merge
  └── Conflicts (duplicate detection by title + year)
        │
        ▼
User confirms
        │
        ▼
Execute import (transactional)
  └── Rollback on error
```

## Offline Recommendations

```typescript
function generateRecommendations(profileId: string): Media[] {
  const data = getFullProfileData(profileId);
  
  // Find unwatched media with similar genre/actor/director
  // to highly-rated watched media
  const topGenres = getTopGenres(data);
  const topDirectors = getTopDirectors(data);
  const topActors = getTopActors(data);
  
  return getUnwatchedMedia(profileId)
    .filter(m => matchesProfile(m, { topGenres, topDirectors, topActors }))
    .sort(byRelevanceScore)
    .slice(0, 20);
}
```

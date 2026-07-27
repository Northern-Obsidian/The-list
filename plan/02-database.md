# Database Schema Plan

## Overview

SQLite database managed via Drizzle ORM. Single file stored in app document directory. Optional encryption via SQLCipher.

## Core Entity Relationship

```
┌──────────┐     ┌──────────┐     ┌────────────┐
│  Profile │1──N│  Media   │1──N│  Series    │
└──────────┘     │          │     └─────┬──────┘
                 │ (polym.) │           │1
                 └────┬─────┘     ┌─────┴──────┐
                      │           │  Season    │1──N┐
                      │           └─────┬──────┘    │
                      │                 │1          │
                      │           ┌─────┴──────┐    │
                      │           │  Episode   │◄───┘
                      │           └────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
   ┌────┴───┐   ┌─────┴────┐   ┌────┴───┐
   │  Tags  │   │Collections│   │Watch   │
   │ M──N   │   │   M──N    │   │History │
   └────────┘   └──────────┘   │ 1──N   │
                               └────────┘
   ┌────────┐   ┌──────────┐   ┌────────────┐
   │Ratings │   │ Reviews  │   │Achievements│
   │ 1──1   │   │   1──1   │   │   N──M     │
   └────────┘   └──────────┘   └────────────┘
```

## Table Definitions

### profiles
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,            -- UUID
  name TEXT NOT NULL,
  avatar TEXT,                    -- local path or emoji
  is_active INTEGER DEFAULT 0,    -- only one active at a time
  pin TEXT,                       -- optional PIN hash
  is_guest INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### media
```sql
CREATE TABLE media (
  id TEXT PRIMARY KEY,            -- UUID
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,       -- 'movie', 'tv_show', 'anime', 'documentary', 'web_series', 'mini_series', 'ova', 'cartoon', 'reality_show', 'podcast', 'audiobook', 'book'
  title TEXT NOT NULL,
  original_title TEXT,
  sort_title TEXT,                -- normalized for sorting
  overview TEXT,
  poster_path TEXT,               -- local cached path
  backdrop_path TEXT,             -- local cached path
  runtime INTEGER,                -- minutes
  year INTEGER,
  genres TEXT,                    -- JSON array ["Action","Drama"]
  studio TEXT,
  country TEXT,
  language TEXT,
  director TEXT,                  -- JSON array
  actors TEXT,                    -- JSON array
  status TEXT NOT NULL DEFAULT 'plan_to_watch',  -- watching, completed, paused, dropped, plan_to_watch, rewatching
  personal_rating REAL,           -- 0-10 scale
  favorite INTEGER DEFAULT 0,     -- boolean
  rewatch_count INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT,                      -- JSON array of tag IDs
  collection_ids TEXT,            -- JSON array of collection IDs
  imported_from TEXT,             -- source marker for imported data
  custom_fields TEXT,             -- JSON for user-defined fields (future)
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_media_profile ON media(profile_id);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_title ON media(title COLLATE NOCASE);
CREATE INDEX idx_media_year ON media(year);
CREATE INDEX idx_media_genres ON media(genres);
```

### series
```sql
CREATE TABLE series (
  id TEXT PRIMARY KEY,            -- UUID (same as media.id for series-type media)
  total_seasons INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 0,
  air_status TEXT,                -- 'airing', 'completed', 'upcoming'
  start_date TEXT,
  end_date TEXT,
  next_episode_date TEXT,
  FOREIGN KEY (id) REFERENCES media(id) ON DELETE CASCADE
);
```

### seasons
```sql
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,            -- UUID
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_count INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  title TEXT,                     -- optional season title
  overview TEXT,
  poster_path TEXT,
  air_date TEXT,
  is_filler INTEGER DEFAULT 0,   -- for anime filler seasons
  UNIQUE(series_id, season_number)
);

CREATE INDEX idx_seasons_series ON seasons(series_id);
```

### episodes
```sql
CREATE TABLE episodes (
  id TEXT PRIMARY KEY,            -- UUID
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT,
  overview TEXT,
  runtime INTEGER,               -- minutes
  air_date TEXT,
  still_path TEXT,               -- local cached
  watched INTEGER DEFAULT 0,     -- boolean
  watch_date TEXT,
  personal_rating REAL,
  notes TEXT,
  favorite INTEGER DEFAULT 0,
  is_filler INTEGER DEFAULT 0,   -- for anime
  is_special INTEGER DEFAULT 0,
  is_recap INTEGER DEFAULT 0,
  UNIQUE(season_id, episode_number)
);

CREATE INDEX idx_episodes_series ON episodes(series_id);
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_episodes_watched ON episodes(watched);
```

### collections
```sql
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_path TEXT,                -- local cached
  color TEXT,                     -- accent color
  icon TEXT,                      -- icon name
  is_smart INTEGER DEFAULT 0,    -- dynamic collection based on rules
  smart_rules TEXT,               -- JSON for smart collection filters
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_collections_profile ON collections(profile_id);
```

### media_collections (join)
```sql
CREATE TABLE media_collections (
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (media_id, collection_id)
);
```

### tags
```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#888888',
  UNIQUE(profile_id, name)
);
```

### media_tags (join)
```sql
CREATE TABLE media_tags (
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, tag_id)
);
```

### watch_history
```sql
CREATE TABLE watch_history (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id) ON DELETE SET NULL,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  watched_at TEXT NOT NULL,        -- ISO 8601 timestamp
  duration_minutes INTEGER,       -- how long was this session
  note TEXT,                      -- optional memory capsule note
  watched_with TEXT,               -- "with Sarah" etc
  mood TEXT,                       -- how they felt during/after
  platform TEXT,                  -- where they watched it
  device TEXT                     -- what device
);

CREATE INDEX idx_watch_history_media ON watch_history(media_id);
CREATE INDEX idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX idx_watch_history_date ON watch_history(watched_at);
```

### reviews
```sql
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_spoiler INTEGER DEFAULT 0,
  favorite_scene TEXT,            -- user's favorite scene description
  quotes TEXT,                    -- JSON array of memorable quotes
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(media_id, profile_id)    -- one review per media per profile
);
```

### ratings
```sql
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score REAL NOT NULL,            -- 1-10 scale
  heart INTEGER DEFAULT 0,
  thumbs_up INTEGER DEFAULT 0,
  masterpiece INTEGER DEFAULT 0,
  need_rewatch INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(media_id, profile_id)
);
```

### achievements
```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,               -- 'first_movie', 'movie_mania', etc.
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TEXT,
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  is_secret INTEGER DEFAULT 0,
  UNIQUE(profile_id, key)
);
```

### backups
```sql
CREATE TABLE backups (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version TEXT NOT NULL,           -- app version at backup time
  file_size INTEGER,
  checksum TEXT,
  drive_file_id TEXT,             -- Google Drive file ID
  created_at TEXT NOT NULL,
  restored_at TEXT
);
```

### preferences
```sql
CREATE TABLE preferences (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,               -- 'theme', 'language', etc.
  value TEXT NOT NULL,             -- JSON encoded value
  UNIQUE(profile_id, key)
);
```

## Smart Collections (Dynamic Rules)

Smart collections use JSON rules stored in `collections.smart_rules`:

```json
{
  "match": "all",                // "all" or "any"
  "rules": [
    { "field": "genres", "op": "contains", "value": "Sci-Fi" },
    { "field": "personal_rating", "op": "gte", "value": 9 },
    { "field": "status", "op": "eq", "value": "completed" },
    { "field": "year", "op": "gte", "value": 2020 }
  ]
}
```

## Memory Capsule (Watch History Enhancements)

Each `watch_history` entry can store rich context:

- `note`: "Watched the finale with pizza, cried for 20 minutes"
- `watched_with`: "Mom", "Friends", "Alone"
- `mood`: "excited", "emotional", "bored", "mind-blown"
- `platform`: "Netflix", "DVD", "Cinema", "YouTube"
- `device`: "iPhone", "TV", "iPad", "Laptop"

This creates a personal entertainment journal.

## Offline Image Storage

- Posters, backdrops, and episode stills stored in app cache directory
- expo-image handles caching automatically
- User can import custom posters from gallery
- Adaptive placeholders generated for missing images
- Cache invalidation on database version migration

## Migration Strategy

- Drizzle Kit generates migration files
- Each migration is timestamped and sequential
- Rollback support for development
- Automatic migration on app launch
- Backup before migration if Drive connected

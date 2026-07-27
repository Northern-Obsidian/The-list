

const migrations: { sql: string }[] = [
  {
    sql: `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  is_active INTEGER DEFAULT 0,
  pin TEXT,
  is_guest INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  title TEXT NOT NULL,
  original_title TEXT,
  sort_title TEXT,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  runtime INTEGER,
  year INTEGER,
  genres TEXT,
  studio TEXT,
  country TEXT,
  language TEXT,
  director TEXT,
  actors TEXT,
  status TEXT NOT NULL DEFAULT 'plan_to_watch',
  personal_rating REAL,
  favorite INTEGER DEFAULT 0,
  rewatch_count INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT,
  collection_ids TEXT,
  imported_from TEXT,
  custom_fields TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_profile ON media(profile_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
CREATE INDEX IF NOT EXISTS idx_media_title ON media(title);
CREATE INDEX IF NOT EXISTS idx_media_year ON media(year);

CREATE TABLE IF NOT EXISTS series (
  id TEXT PRIMARY KEY REFERENCES media(id) ON DELETE CASCADE,
  total_seasons INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 0,
  air_status TEXT,
  start_date TEXT,
  end_date TEXT,
  next_episode_date TEXT
);

CREATE TABLE IF NOT EXISTS seasons (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_count INTEGER DEFAULT 0,
  completed_episodes INTEGER DEFAULT 0,
  title TEXT,
  overview TEXT,
  poster_path TEXT,
  air_date TEXT,
  is_filler INTEGER DEFAULT 0,
  UNIQUE(series_id, season_number)
);

CREATE INDEX IF NOT EXISTS idx_seasons_series ON seasons(series_id);

CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  season_id TEXT NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT,
  overview TEXT,
  runtime INTEGER,
  air_date TEXT,
  still_path TEXT,
  watched INTEGER DEFAULT 0,
  watch_date TEXT,
  personal_rating REAL,
  notes TEXT,
  favorite INTEGER DEFAULT 0,
  is_filler INTEGER DEFAULT 0,
  is_special INTEGER DEFAULT 0,
  is_recap INTEGER DEFAULT 0,
  UNIQUE(season_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_watched ON episodes(watched);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_path TEXT,
  color TEXT,
  icon TEXT,
  is_smart INTEGER DEFAULT 0,
  smart_rules TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collections_profile ON collections(profile_id);

CREATE TABLE IF NOT EXISTS media_collections (
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (media_id, collection_id)
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#888888',
  UNIQUE(profile_id, name)
);

CREATE TABLE IF NOT EXISTS media_tags (
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (media_id, tag_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  episode_id TEXT REFERENCES episodes(id) ON DELETE SET NULL,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  watched_at TEXT NOT NULL,
  duration_minutes INTEGER,
  note TEXT,
  watched_with TEXT,
  mood TEXT,
  platform TEXT,
  device TEXT
);

CREATE INDEX IF NOT EXISTS idx_watch_history_media ON watch_history(media_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_date ON watch_history(watched_at);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_spoiler INTEGER DEFAULT 0,
  favorite_scene TEXT,
  quotes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(media_id, profile_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  media_id TEXT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score REAL NOT NULL,
  heart INTEGER DEFAULT 0,
  thumbs_up INTEGER DEFAULT 0,
  masterpiece INTEGER DEFAULT 0,
  need_rewatch INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(media_id, profile_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TEXT,
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  is_secret INTEGER DEFAULT 0,
  UNIQUE(profile_id, key)
);

CREATE TABLE IF NOT EXISTS backups (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  file_size INTEGER,
  checksum TEXT,
  drive_file_id TEXT,
  created_at TEXT NOT NULL,
  restored_at TEXT
);

CREATE TABLE IF NOT EXISTS preferences (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  UNIQUE(profile_id, key)
);
`,
  },
];

export default migrations;

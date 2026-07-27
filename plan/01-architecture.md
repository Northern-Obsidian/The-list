# Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer (React Native)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Screens  │ │Components│ │  Hooks   │ │  Navigation   │  │
│  │ (Expo     │ │ (Reusable│ │ (Data    │ │ (Expo Router) │  │
│  │  Router)  │ │  UI)     │ │  Access) │ │               │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  State & Data Layer                          │
│  ┌────────────────────┐ ┌──────────────────────────────┐    │
│  │   React Context    │ │   React Query / SWR          │    │
│  │   (Theme, Auth,    │ │   (not needed - offline      │    │
│  │    Preferences)    │ │    direct DB access)          │    │
│  └────────────────────┘ └──────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                   Storage Layer                              │
│  ┌─────────────┐ ┌──────────────────┐ ┌───────────────┐   │
│  │   SQLite    │ │    Drizzle ORM   │ │   MMKV        │   │
│  │ (Main DB)   │ │  (Type-safe      │ │ (Preferences, │   │
│  │  .db file)  │ │   queries)       │ │  Cache)       │   │
│  └─────────────┘ └──────────────────┘ └───────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Backup Layer (Optional)                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Google Drive App Folder API              │     │
│  │           (Encrypted .db export/import)               │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Offline-First
- All data lives in a local SQLite database
- No network calls for core functionality
- Images cached via expo-image with local fallback
- Backup is the only network-dependent feature

### Type Safety
- Drizzle ORM provides full TypeScript types for all queries
- Zod schemas validate data at runtime boundaries (import/export, backup restore)
- Shared types between database, components, and API routes

### Performance
- MMKV for fast key-value preferences (theme, settings, profile)
- SQLite with proper indexing on searchable columns (title, genre, year)
- Virtual scrolling for large lists (FlatList with getItemLayout)
- Lazy loading images with expo-image cache

### No External Dependencies for Core Data
- No reliance on TMDB, IMDb, or any API
- User enters metadata manually or imports
- Future: optional metadata providers as plugins

## Directory Structure

```
src/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx               # Root layout (providers, theme)
│   ├── index.tsx                 # Home / Dashboard
│   ├── explore.tsx               # Browse / Search
│   ├── (tabs)/                   # Tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home tab
│   │   ├── search.tsx            # Search tab
│   │   ├── library.tsx           # Library tab
│   │   ├── stats.tsx             # Statistics tab
│   │   └── settings.tsx          # Settings tab
│   ├── media/
│   │   ├── [id].tsx              # Media detail page
│   │   ├── [id]/edit.tsx         # Edit media
│   │   └── new.tsx               # Add new media
│   ├── series/
│   │   ├── [id].tsx              # Series detail
│   │   ├── [id]/season/
│   │   │   └── [seasonNumber].tsx # Season detail
│   │   └── [id]/episode/
│   │       └── [episodeId].tsx   # Episode detail
│   ├── collections/
│   │   ├── index.tsx             # All collections
│   │   ├── [id].tsx              # Collection detail
│   │   └── new.tsx               # New collection
│   ├── tags/
│   │   └── [id].tsx              # Tag detail
│   ├── calendar.tsx              # Calendar view
│   ├── timeline.tsx              # Timeline / heatmap
│   └── achievements.tsx          # Achievements
│
├── components/                   # Reusable components
│   ├── ui/                       # Base UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── sheet.tsx
│   │   ├── badge.tsx
│   │   ├── chip.tsx
│   │   ├── divider.tsx
│   │   ├── avatar.tsx
│   │   ├── icon-button.tsx
│   │   ├── skeleton.tsx
│   │   ├── empty-state.tsx
│   │   └── progress-bar.tsx
│   ├── media/                    # Media-specific components
│   │   ├── media-card.tsx        # Card for any media type
│   │   ├── media-grid.tsx        # Grid layout
│   │   ├── media-list.tsx        # List layout
│   │   ├── media-poster.tsx      # Poster with fallback
│   │   ├── media-status-badge.tsx
│   │   ├── media-rating.tsx      # Personal rating display
│   │   ├── media-metadata.tsx    # Metadata display
│   │   └── media-form.tsx        # Add/edit form
│   ├── series/                   # Series-specific components
│   │   ├── season-list.tsx
│   │   ├── episode-list.tsx
│   │   ├── episode-row.tsx
│   │   ├── episode-form.tsx
│   │   ├── series-progress.tsx
│   │   └── season-progress.tsx
│   ├── movie/                    # Movie-specific components
│   │   ├── movie-detail.tsx
│   │   └── movie-form.tsx
│   ├── home/                     # Home screen components
│   │   ├── greeting-header.tsx
│   │   ├── continue-watching.tsx
│   │   ├── statistics-summary.tsx
│   │   ├── recent-activity.tsx
│   │   ├── collections-rail.tsx
│   │   ├── upcoming-planned.tsx
│   │   ├── favorites-rail.tsx
│   │   ├── random-pick.tsx
│   │   └── trending-section.tsx
│   ├── collections/
│   │   ├── collection-card.tsx
│   │   └── collection-form.tsx
│   ├── stats/                    # Statistics components
│   │   ├── stat-card.tsx
│   │   ├── genre-chart.tsx
│   │   ├── activity-chart.tsx
│   │   ├── streak-display.tsx
│   │   ├── timeline-heatmap.tsx
│   │   ├── monthly-activity.tsx
│   │   └── yearly-report.tsx
│   ├── achievements/
│   │   ├── achievement-card.tsx
│   │   ├── achievement-list.tsx
│   │   └── achievement-unlock.tsx
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── search-filters.tsx
│   │   └── search-results.tsx
│   ├── calendar/
│   │   ├── calendar-view.tsx
│   │   └── calendar-day.tsx
│   ├── backup/
│   │   ├── backup-settings.tsx
│   │   ├── restore-picker.tsx
│   │   └── backup-status.tsx
│   ├── profile/
│   │   ├── profile-switcher.tsx
│   │   ├── profile-card.tsx
│   │   └── profile-form.tsx
│   ├── tags/
│   │   ├── tag-chip.tsx
│   │   └── tag-picker.tsx
│   └── settings/
│       ├── theme-picker.tsx
│       ├── security-section.tsx
│       └── export-import.tsx
│
├── db/                           # Database layer
│   ├── index.ts                  # DB connection & init
│   ├── schema/                   # Drizzle schema definitions
│   │   ├── media.ts
│   │   ├── series.ts
│   │   ├── season.ts
│   │   ├── episode.ts
│   │   ├── collections.ts
│   │   ├── tags.ts
│   │   ├── watch-history.ts
│   │   ├── ratings.ts
│   │   ├── reviews.ts
│   │   ├── achievements.ts
│   │   ├── profiles.ts
│   │   ├── backups.ts
│   │   └── preferences.ts
│   ├── queries/                  # Type-safe query functions
│   │   ├── media.ts
│   │   ├── series.ts
│   │   ├── season.ts
│   │   ├── episode.ts
│   │   ├── collections.ts
│   │   ├── tags.ts
│   │   ├── stats.ts
│   │   ├── search.ts
│   │   ├── calendar.ts
│   │   └── achievements.ts
│   ├── migrations/               # Schema migration files
│   │   └── 0000_initial.ts
│   └── utils.ts                  # DB helpers
│
├── stores/                       # State management
│   ├── use-media-store.ts        # Media CRUD operations
│   ├── use-series-store.ts       # Series tracking state
│   ├── use-episode-store.ts      # Episode tracking state
│   ├── use-collection-store.ts   # Collections state
│   ├── use-tag-store.ts          # Tags state
│   ├── use-profile-store.ts      # Active profile
│   ├── use-preference-store.ts   # User preferences
│   └── use-backup-store.ts       # Backup state
│
├── services/                     # Business logic
│   ├── progress-engine.ts        # Universal progress calculations
│   ├── stats-engine.ts           # Statistics calculations
│   ├── achievement-engine.ts     # Achievement checking
│   ├── recommendation-engine.ts  # Offline recommendations
│   ├── random-picker.ts          # Random selection logic
│   ├── backup-service.ts         # Google Drive backup
│   ├── export-service.ts         # Export (JSON/CSV/MD/PDF)
│   ├── import-service.ts         # Import from files
│   └── notification-service.ts   # Local notifications
│
├── hooks/                        # React hooks
│   ├── use-db.ts                 # DB access hook
│   ├── use-media.ts              # Media queries
│   ├── use-series.ts             # Series queries
│   ├── use-episodes.ts           # Episode queries
│   ├── use-collections.ts        # Collection queries
│   ├── use-tags.ts               # Tag queries
│   ├── use-stats.ts              # Statistics queries
│   ├── use-achievements.ts       # Achievement queries
│   ├── use-search.ts             # Search with debounce
│   ├── use-calendar.ts           # Calendar data
│   ├── use-backup.ts             # Backup operations
│   ├── use-progress.ts           # Progress tracking
│   ├── use-random-pick.ts        # Random picker
│   ├── use-color-scheme.ts       # Color scheme detection
│   └── use-theme.ts              # Theme access
│
├── constants/                    # Constants & configuration
│   ├── theme.ts                  # Colors, spacing, fonts
│   ├── media-types.ts            # Media type definitions
│   ├── statuses.ts               # Watch status enums
│   ├── ratings.ts                # Rating system config
│   ├── achievements.ts           # Achievement definitions
│   └── defaults.ts               # Default values
│
├── types/                        # Shared TypeScript types
│   ├── media.ts
│   ├── series.ts
│   ├── episode.ts
│   ├── collection.ts
│   ├── tag.ts
│   ├── stats.ts
│   ├── backup.ts
│   ├── profile.ts
│   ├── navigation.ts
│   └── theme.ts
│
├── utils/                        # Utility functions
│   ├── format.ts                 # Date, duration, number formatting
│   ├── validation.ts             # Zod schemas for validation
│   ├── id.ts                     # UUID generation
│   ├── image.ts                  # Image helpers
│   ├── date.ts                   # Date manipulation
│   ├── color.ts                  # Color manipulation
│   └── storage.ts                # MMKV helpers
│
├── animations/                   # Reanimated animations
│   ├── spring-configs.ts         # Shared spring configurations
│   ├── shared-transitions.ts     # Shared element transitions
│   ├── parallax.ts               # Parallax effects
│   └── glass-effect.tsx          # Glassmorphism components
│
└── assets/                       # Local assets (managed by Expo)
```

## Technology Decisions

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Expo SDK 56 | Latest stable, full native access |
| Navigation | Expo Router 4 | File-based, type-safe, deep linking |
| Database | SQLite via expo-sqlite | Mature, reliable, offline-first |
| ORM | Drizzle ORM | Type-safe, lightweight, SQL-like |
| Preferences | MMKV | Fastest key-value storage |
| Animations | Reanimated 4 | 60fps UI thread animations |
| Gestures | Gesture Handler | Performant gesture system |
| Styling | StyleSheet (no NativeWind) | Avoid build complexity, full control |
| Charts | Victory Native XL | SVG charts, good customization |
| Images | expo-image | Caching, placeholders, transitions |
| Icons | expo-symbols | Native SF Symbols / Material icons |
| Glass Effect | expo-glass-effect | Native blur views |
| Auth (optional) | Google Sign-In | Only for Drive backup |

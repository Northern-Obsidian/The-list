# Implementation Phases

## Phase 0: Foundation (Week 1)

### Goals
- Project scaffolding
- Database schema & initialization
- Basic navigation structure
- Theme system
- Core UI components

### Tasks
- [ ] 0.1: Set up Expo SDK 56 project with TypeScript
- [ ] 0.2: Configure Expo Router with type-safe routes
- [ ] 0.3: Set up SQLite + Drizzle ORM with schema
- [ ] 0.4: Run initial migration
- [ ] 0.5: Build database connection provider
- [ ] 0.6: Create theme system (light/dark/AMOLED)
- [ ] 0.7: Build base UI component library
  - [ ] Button, Card, Input, Badge, Modal, Sheet, Skeleton
  - [ ] EmptyState, ProgressBar, Chip, IconButton, Divider
- [ ] 0.8: Set up tab navigation (Home, Search, Library, Stats, Settings)
- [ ] 0.9: Implement profile system (create, switch, delete)
- [ ] 0.10: Set up MMKV for preferences

### Deliverables
- Working app with tab navigation
- Database initialized with all tables
- Profile creation flow
- Theme switching works
- Base UI components documented

---

## Phase 1: Core Library (Week 2)

### Goals
- Add media items
- Browse and search library
- Media detail pages
- Basic progress tracking

### Tasks
- [ ] 1.1: Build "Add Media" flow with type picker and form
- [ ] 1.2: Implement media CRUD hooks
- [ ] 1.3: Build Library screen with grid/list toggle
- [ ] 1.4: Build MediaCard component with poster, title, status
- [ ] 1.5: Build MediaDetail screen
  - [ ] Poster hero with parallax
  - [ ] Metadata display
  - [ ] Status management
  - [ ] Personal rating (1-10 stars, heart, thumbs up)
  - [ ] Notes field
  - [ ] Delete with confirmation
- [ ] 1.6: Implement search with debounce
- [ ] 1.7: Build Search screen with filters (type, genre, year, status)
- [ ] 1.8: Implement media type filtering chips
- [ ] 1.9: Implement status filtering (watching, completed, etc.)
- [ ] 1.10: Add edit media functionality

### Deliverables
- Users can add any media type
- Full library browsing with filters
- Search works offline
- Media detail with all metadata
- Ratings and notes functional

---

## Phase 2: Series Tracking (Week 3)

### Goals
- Series/season/episode data model
- Episode tracking
- Automatic progress calculation
- Series detail with season breakdown

### Tasks
- [ ] 2.1: Add series-specific fields to media form
- [ ] 2.2: Build episode management (add/delete/reorder)
- [ ] 2.3: Build season management
- [ ] 2.4: Build SeriesDetail screen (seasons overview)
- [ ] 2.5: Build SeasonDetail screen (episode list)
- [ ] 2.6: Build EpisodeDetail screen
- [ ] 2.7: Implement episode watch toggle
- [ ] 2.8: Implement progress engine
  - [ ] Per-season progress
  - [ ] Per-series progress
  - [ ] Completion percentage
  - [ ] Next episode calculation
- [ ] 2.9: Build EpisodeRow component with watched/rating/favorite
- [ ] 2.10: Implement "Mark all watched" for season
- [ ] 2.11: Add bulk episode operations

### Deliverables
- Full series tracking with seasons and episodes
- Auto-progress calculation
- Mark episodes watched, progress updates everywhere
- Series detail with expandable season list

---

## Phase 3: Collections & Tags (Week 4)

### Goals
- Collections (manual and smart)
- Tags system
- Collection browser

### Tasks
- [ ] 3.1: Build collection CRUD
- [ ] 3.2: Add media to collections (multi-select)
- [ ] 3.3: Build CollectionCard component
- [ ] 3.4: Build CollectionDetail screen
- [ ] 3.5: Implement smart collections with rule engine
  - [ ] Rule builder UI (field, operator, value)
  - [ ] Auto-refresh on data changes
- [ ] 3.6: Build tag CRUD
- [ ] 3.7: Build TagPicker component
- [ ] 3.8: Add tags to media form and detail
- [ ] 3.9: Build tag filter in search
- [ ] 3.10: Build collections rail on home

### Deliverables
- Users can create collections and add media
- Smart collections auto-update
- Tags fully functional with filtering
- Home screen shows collections

---

## Phase 4: Home Screen & Dashboard (Week 5)

### Goals
- Beautiful animated home
- Continue watching section
- Statistics summary
- Recent activity
- Random picker
- Favorites rail

### Tasks
- [ ] 4.1: Build GreetingHeader with time-based greeting
- [ ] 4.2: Build ContinueWatching rail
  - [ ] Query in-progress media
  - [ ] Show progress bar on cards
  - [ ] Tap to continue
- [ ] 4.3: Build StatisticsSummary cards
- [ ] 4.4: Build RecentActivity list
- [ ] 4.5: Build UpcomingPlanned section
- [ ] 4.6: Build FavoritesRail
- [ ] 4.7: Build RandomPick component with reroll
- [ ] 4.8: Build TrendingSection (most watched genres/studios)
- [ ] 4.9: Implement animations
  - [ ] Staggered card entry
  - [ ] Parallax scrolling
  - [ ] Glassmorphism cards
- [ ] 4.10: Wire up all sections to real data

### Deliverables
- Stunning home screen with all sections
- Continue watching works
- Random picker functional
- Recent activity shows real history

---

## Phase 5: Statistics & Analytics (Week 6)

### Goals
- Full statistics dashboard
- Charts (genre distribution, monthly activity)
- Timeline heatmap (GitHub-style)
- Streak tracking
- Achievements

### Tasks
- [ ] 5.1: Build stats engine
- [ ] 5.2: Build StatCard component
- [ ] 5.3: Build dashboard summary (totals, hours, streaks)
- [ ] 5.4: Build GenreChart (Victory Native XL pie/donut)
- [ ] 5.5: Build MonthlyActivity chart (bar chart)
- [ ] 5.6: Build TimelineHeatmap (GitHub contributions style)
- [ ] 5.7: Build StreakDisplay
- [ ] 5.8: Build achievement engine
- [ ] 5.9: Define all achievement criteria
- [ ] 5.10: Build AchievementCard with progress
- [ ] 5.11: Build Achievements screen
- [ ] 5.12: Add YearlyReport section

### Deliverables
- Rich statistics with charts
- GitHub-style timeline heatmap
- Streak tracking
- Fully functional achievements with unlock animations

---

## Phase 6: Calendar & Memory Capsule (Week 7)

### Goals
- Calendar view (daily/weekly/monthly/yearly)
- Memory capsule (rich watch history)
- Watch history management

### Tasks
- [ ] 6.1: Build CalendarView component
  - [ ] Month grid with activity dots
  - [ ] Day selection
  - [ ] Daily/weekly/monthly/yearly toggles
- [ ] 6.2: Build CalendarDay component
- [ ] 6.3: Implement day detail view with history entries
- [ ] 6.4: Build MemoryCapsule form
  - [ ] Note field
  - [ ] Mood picker
  - [ ] Platform input
  - [ ] Device input
  - [ ] Watched-with input
- [ ] 6.5: Integrate memory capsule into watch flow
- [ ] 6.6: Add watch history management (edit/delete entries)
- [ ] 6.7: Build Timeline screen (GitHub heatmap + year picker)

### Deliverables
- Calendar with watch history
- Memory capsule for rich entries
- Timeline heatmap
- Complete watch history management

---

## Phase 7: Themes & UI Polish (Week 8)

### Goals
- All theme variants (Dark, AMOLED, Light, Glass, Cyberpunk, Neon, Minimal)
- Dynamic colors (Material You)
- Glassmorphism effects
- Animations and transitions
- Haptic feedback
- Widget basics

### Tasks
- [ ] 7.1: Define all theme color palettes
- [ ] 7.2: Build ThemePicker component
- [ ] 7.3: Implement AMOLED theme (true blacks)
- [ ] 7.4: Implement Glass theme (frosted glass)
- [ ] 7.5: Implement Cyberpunk theme (neon on dark)
- [ ] 7.6: Implement Neon theme (vibrant bright)
- [ ] 7.7: Implement Minimal theme (reduced UI)
- [ ] 7.8: Add Material You dynamic color support
- [ ] 7.9: Add glassmorphism to key components
- [ ] 7.10: Add shared element transitions
- [ ] 7.11: Add staggered list animations
- [ ] 7.12: Add haptic feedback on interactions
- [ ] 7.13: Build Android home widget (ContinueWatching)
- [ ] 7.14: Performance optimization pass

### Deliverables
- 7 themes fully implemented
- Dynamic colors on Android
- Smooth animations throughout
- Android widget
- Polish pass complete

---

## Phase 8: Backup & Import/Export (Week 9)

### Goals
- Google Drive backup
- Export (JSON, CSV, Markdown, PDF)
- Import (JSON, CSV)
- Backup encryption
- Auto-backup scheduling

### Tasks
- [ ] 8.1: Set up Google Sign-In
- [ ] 8.2: Implement Google Drive App Folder API
- [ ] 8.3: Build BackupService
  - [ ] Database export to JSON
  - [ ] Compression
  - [ ] Upload to Drive
  - [ ] Download from Drive
  - [ ] Restore
  - [ ] Merge (import into existing DB)
- [ ] 8.4: Add encryption for backup files
- [ ] 8.5: Build BackupSettings screen
- [ ] 8.6: Build backup status indicator
- [ ] 8.7: Implement auto-backup scheduling
- [ ] 8.8: Build ExportService
  - [ ] JSON export
  - [ ] CSV export
  - [ ] Markdown export
  - [ ] PDF export (print to PDF)
- [ ] 8.9: Build ImportService
  - [ ] JSON import
  - [ ] CSV import
  - [ ] Backup restore
- [ ] 8.10: Build Import screen with preview
- [ ] 8.11: Duplicate detection and conflict resolution

### Deliverables
- Google Drive backup/restore works
- Export to all 4 formats
- Import from JSON/CSV
- Auto-backup scheduling

---

## Phase 9: Notifications & Polish (Week 10)

### Goals
- Local notifications
- Continue watching reminders
- Daily/weekly goals
- Streak reminders
- Final polish

### Tasks
- [ ] 9.1: Set up expo-notifications
- [ ] 9.2: Build notification service
- [ ] 9.3: Continue watching reminder (after X days idle)
- [ ] 9.4: Daily goal notification
- [ ] 9.5: Weekly summary notification
- [ ] 9.6: Streak reminder
- [ ] 9.7: Backup reminder
- [ ] 9.8: Build notification settings UI
- [ ] 9.9: Final animation polish
- [ ] 9.10: Edge case handling
- [ ] 9.11: Performance profiling and optimization
- [ ] 9.12: Accessibility pass (screen reader support)
- [ ] 9.13: Error boundary implementation

### Deliverables
- All notifications functional
- Complete settings for notifications
- Production-ready polish

---

## Phase 10: Security & Extras (Week 11)

### Goals
- Biometric lock
- PIN protection
- Wear OS support (basic)
- AI features (optional)

### Tasks
- [ ] 10.1: Implement biometric authentication (Face ID / fingerprint)
- [ ] 10.2: Implement PIN lock
- [ ] 10.3: Build SecuritySection in settings
- [ ] 10.4: Add app lock on resume
- [ ] 10.5: Wear OS companion features
  - [ ] Mark episode watched
  - [ ] Quick rating
  - [ ] Voice notes
- [ ] 10.6: Offline AI (optional - on-device ML)
  - [ ] Note summarization
  - [ ] Pattern analysis
  - [ ] Smart suggestions

### Deliverables
- App lock with biometric/PIN
- Wear OS support
- Optional AI features

---

## Phase 11: Testing & Release (Week 12)

### Goals
- Comprehensive testing
- Bug fixes
- App store preparation
- Documentation

### Tasks
- [ ] 11.1: Unit tests for progress engine
- [ ] 11.2: Unit tests for stats engine
- [ ] 11.3: Unit tests for achievement engine
- [ ] 11.4: Integration tests for data flows
- [ ] 11.5: UI component tests
- [ ] 11.6: Performance testing with large datasets
- [ ] 11.7: Error handling edge cases
- [ ] 11.8: App store metadata preparation
- [ ] 11.9: Privacy policy
- [ ] 11.10: Final build and submission

### Deliverables
- Tested, stable release
- App store submission ready
- Documentation complete

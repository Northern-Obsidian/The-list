# Component Tree & UI Plan

## Component Hierarchy

```
App
├── Providers
│   ├── ThemeProvider (expo-router)
│   ├── DatabaseProvider (context)
│   ├── ProfileProvider (context)
│   └── PreferenceProvider (context)
│
├── AppTabs (NativeTabs)
│   ├── HomeScreen
│   │   ├── GreetingHeader
│   │   │   ├── AnimatedText ("Good Evening, {name}")
│   │   │   └── ProfileSwitcher
│   │   ├── ContinueWatching (horizontal scroll)
│   │   │   └── MediaCard[]
│   │   ├── StatisticsSummary
│   │   │   └── StatCard[] (total, watching, completed)
│   │   ├── RecentActivity
│   │   │   └── ActivityRow[]
│   │   ├── CollectionsRail (horizontal scroll)
│   │   │   └── CollectionCard[]
│   │   ├── UpcomingPlanned
│   │   │   └── MediaCard[]
│   │   ├── FavoritesRail
│   │   │   └── MediaCard[]
│   │   ├── RandomPick
│   │   │   └── MediaCard (with reroll button)
│   │   └── TrendingSection
│   │       └── MediaCard[]
│   │
│   ├── SearchScreen
│   │   ├── SearchBar
│   │   ├── SearchFilters (collapsible)
│   │   │   ├── MediaTypeFilter
│   │   │   ├── GenreFilter
│   │   │   ├── YearRangeFilter
│   │   │   ├── StatusFilter
│   │   │   └── RatingFilter
│   │   └── SearchResults
│   │       ├── MediaGrid (2 columns)
│   │       │   └── MediaCard[]
│   │       └── EmptyState
│   │
│   ├── LibraryScreen
│   │   ├── LibraryHeader
│   │   │   ├── Title
│   │   │   └── ViewToggle (grid/list)
│   │   ├── MediaTypeFilter (horizontal chips)
│   │   │   └── Chip[] (All, Movies, Shows, Anime, etc.)
│   │   ├── StatusFilter (horizontal chips)
│   │   │   └── Chip[] (All, Watching, Completed, etc.)
│   │   ├── SortPicker
│   │   └── MediaGrid | MediaList
│   │       └── MediaCard[] | MediaRow[]
│   │
│   ├── StatsScreen
│   │   ├── DashboardSummary
│   │   │   ├── StatCard[] (total movies, shows, anime, hours, etc.)
│   │   │   └── StreakDisplay
│   │   ├── GenreChart (pie/donut chart)
│   │   ├── MonthlyActivity (bar chart)
│   │   ├── TimelineHeatmap
│   │   ├── YearlyReport
│   │   └── AchievementList
│   │
│   └── SettingsScreen
│       ├── ProfileSection
│       │   ├── ProfileCard
│       │   └── ProfileSwitcher
│       ├── ThemePicker
│       │   ├── ThemeOption[] (Dark/AMOLED/Light/Glass/Cyberpunk/etc.)
│       │   └── DynamicColorToggle
│       ├── SecuritySection
│       │   ├── BiometricToggle
│       │   └── PinSetup
│       ├── BackupSection
│       │   ├── BackupStatus
│       │   ├── BackupNow (button)
│       │   └── AutoBackupToggle
│       ├── ExportImport
│       │   ├── ExportButton
│       │   └── ImportButton
│       ├── NotificationSettings
│       │   ├── ContinueWatchingToggle
│       │   ├── DailyGoalToggle
│       │   └── BackupReminderToggle
│       └── AboutSection
│
├── MediaDetailScreen
│   ├── PosterHero (parallax backdrop)
│   │   ├── BackButton
│   │   ├── PosterImage
│   │   ├── TitleOverlay
│   │   └── ActionButtons (edit, delete, share)
│   ├── MetadataSection
│   │   ├── MediaTypeBadge
│   │   ├── StatusBadge
│   │   ├── RuntimeText
│   │   ├── YearText
│   │   ├── GenreChips[]
│   │   ├── DirectorText
│   │   ├── ActorList
│   │   └── CountryText
│   ├── PersonalRating
│   │   ├── StarRating (1-10)
│   │   ├── HeartButton
│   │   ├── ThumbsUpButton
│   │   └── MasterpieceButton
│   ├── ProgressSection (if series)
│   │   ├── SeriesProgress (season/episode)
│   │   ├── ProgressBar
│   │   └── QuickAction (mark next episode)
│   ├── ReviewSection
│   │   ├── ReviewContent
│   │   ├── SpoilerToggle
│   │   └── FavoriteScenes
│   ├── TagsSection
│   │   ├── TagChip[]
│   │   └── AddTagButton
│   ├── CollectionsSection
│   │   ├── CollectionChip[]
│   │   └── AddToCollectionButton
│   ├── WatchHistorySection
│   │   ├── HistoryEntry[]
│   │   └── AddEntryButton
│   └── RelatedSection (if series)
│       ├── SeasonList
│       └── EpisodeList
│
├── SeriesDetailScreen
│   ├── SeriesHero (same as MediaDetail hero)
│   ├── SeriesProgress
│   │   ├── OverallProgress (X of Y episodes)
│   │   ├── CurrentPositionCard
│   │   └── QuickActions
│   ├── SeasonsSection
│   │   ├── SeasonAccordion[]
│   │   │   ├── SeasonHeader (title, progress, expand)
│   │   │   └── EpisodeList (collapsible)
│   │   │       └── EpisodeRow[]
│   │   └── AddSeasonButton
│   └── SeriesInfo
│       ├── TotalEpisodes
│       ├── AirStatus
│       └── DateRange
│
├── SeasonDetailScreen
│   ├── SeasonHeader
│   │   ├── SeasonTitle
│   │   ├── ProgressBar
│   │   └── EpisodeCountText
│   ├── EpisodeList
│   │   └── EpisodeRow[]
│   │       ├── EpisodeNumber
│   │       ├── Title
│   │       ├── WatchedCheckbox
│   │       ├── Rating
│   │       ├── FavoriteButton
│   │       └── Runtime
│   └── SeasonActions
│       ├── MarkAllWatched
│       └── MarkAllUnwatched
│
├── EpisodeDetailScreen
│   ├── EpisodeHeader
│   ├── EpisodeInfo
│   ├── WatchToggle
│   ├── RatingInput
│   ├── NotesInput
│   ├── MemoryCapsule
│   │   ├── DatePicker
│   │   ├── MoodPicker
│   │   ├── PlatformInput
│   │   └── WatchedWithInput
│   └── DeleteButton
│
├── AddMediaScreen (modal)
│   ├── MediaTypePicker (grid of types)
│   ├── MediaForm
│   │   ├── PosterPicker
│   │   ├── TitleInput
│   │   ├── TypeSelector
│   │   ├── StatusPicker
│   │   ├── GenreMultiSelect
│   │   ├── YearInput
│   │   ├── RuntimeInput
│   │   ├── DirectorInput
│   │   ├── ActorInput
│   │   ├── StudioInput
│   │   ├── CountryInput
│   │   ├── LanguageInput
│   │   ├── OverviewTextArea
│   │   └── SeriesFields (seasons/episodes if series type)
│   └── SaveButton
│
├── CollectionScreen
│   ├── CollectionHeader
│   │   ├── CollectionCover
│   │   ├── CollectionName
│   │   ├── MediaCount
│   │   └── EditButton
│   ├── SmartRulesDisplay (if smart collection)
│   └── MediaGrid
│       └── MediaCard[]
│
├── CalendarScreen
│   ├── CalendarHeader
│   │   ├── MonthNavigation
│   │   └── ViewToggle (daily/weekly/monthly/yearly)
│   └── CalendarView
│       ├── CalendarGrid (month view)
│       │   └── CalendarDay[]
│       │       ├── DayNumber
│       │       └── ActivityDot
│       └── DayDetail (selected day)
│           └── HistoryEntry[]
│
├── TimelineScreen
│   ├── YearPicker
│   └── GitHubStyleHeatmap
│       └── DayCell[]
│
└── AchievementsScreen
    ├── TotalScore
    └── AchievementGroup[]
        └── AchievementCard[]
```

## Base UI Component Specifications

### Button
- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg
- States: default, pressed, disabled, loading
- Icon support (leading/trailing/icon-only)
- Full-width optional

### Card
- Variants: elevated, outlined, flat, glass
- Pressable with haptic feedback
- Context menu on long press
- Image loading skeleton
- Aspect ratio support

### Input
- Variants: default, search, multiline
- Label support
- Error state
- Character count
- Clear button

### Badge
- Variants: filled, outlined, dot
- Colors: based on theme palette
- Size: sm, md

### Modal
- Slide-up from bottom (native)
- Centered (web)
- Backdrop blur
- Gesture dismiss
- Snap points

### Sheet
- Bottom sheet with drag handle
- Configurable snap points
- Backdrop with blur
- Scrollable content

### Skeleton
- Pulse animation
- Configurable width/height
- Border radius matching target
- Multiple variants (card, text, avatar, poster)

### Empty State
- Icon
- Title
- Description
- Action button (optional)
- Illustration or animated graphic

## Animation Principles

- Spring animations for natural feel
- Shared element transitions between cards and detail views
- Staggered list animations on screen entry
- Parallax scrolling in hero sections
- Haptic feedback on interactive elements
- Micro-animations for status changes (watched toggle, rating)
- Glassmorphism with dynamic blur intensity
- Physics-based scrolling with rubber-banding

## Glassmorphism Implementation

```typescript
// Glass card component
<View style={[
  styles.glass,
  Platform.OS === 'ios' && {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
  }
]}>
```

Using `expo-glass-effect` for native blur views on iOS/Android.

## Responsive Layout Strategy

- Mobile-first single column
- Tablet: 2-column grid, side panels on detail views
- Web: left sidebar + main content, max-width container
- Breakpoints defined in constants
- Adaptive grid columns based on screen width

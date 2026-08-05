# NextWatch — UI Skeleton Rework Plan

> Extracted from the v2 premium redesign. Skeleton only — no color decisions.
> This document maps every structural change from the current app to the new design.

---

## Global structural changes

### 1. Tab bar → Floating pill
Current: native `NativeTabs` (iOS) / custom `Tabs` (web), 5 separate screens.
New: single **floating pill** bar anchored above bottom safe area, 5 icon+label items.
- Files: `src/components/app-tabs.tsx`, `src/components/app-tabs.web.tsx`
- Remove: `NativeTabs` / expo-router tabs entirely
- New: `src/components/floating-tab-bar.tsx` (shared native+web)
- Layout: `(tabs)/_layout.tsx` → plain `Slot` or `Stack`, floating bar rendered by root or by each tab screen

### 2. Screen count reduction
Current 27 routes → ~15 core screens. Many modals become inline or bottom sheets.

| Current route | New treatment |
|---|---|
| `onboarding/index` | stays (restyle) |
| `(tabs)/index` → Home | stays (restyle) |
| `(tabs)/search` → Discover | stays (restyle) |
| `(tabs)/library` → Library | stays (restyle) |
| `(tabs)/stats` → Insights | stays (restyle) |
| `(tabs)/settings` → You/Profile | stays (restyle) |
| `media/[id]` | stays (restyle, hero rework) |
| `media/new` | stays (restyle) |
| `media/[id]/edit` | becomes bottom sheet inside detail |
| `media/[id]/review` | becomes bottom sheet inside detail |
| `series/[id]` | merged into `media/[id]` (tabbed view) |
| `series/[id]/season/[n]` | merged into media detail (collapsible list) |
| `series/[id]/episode/[id]` | bottom sheet or inline expand |
| `collections/index` | stays (restyle) |
| `collections/new` | stays (restyle) |
| `collections/[id]` | stays (restyle) |
| `collections/[id]/edit` | becomes bottom sheet |
| `tags/index` | merged into Discover or Library filter |
| `tags/[id]` | stays |
| `calendar` | stays (restyle) |
| `timeline` | stays (restyle) |
| `achievements` | stays (restyle) |
| `history` | merged into Insights or Calendar |
| `backup` | merged into You/Profile menu → bottom sheet |
| `import` | merged into You/Profile menu → bottom sheet |
| `profile/index` | merged into You/Profile screen |

---

## Screen-by-screen skeleton

---

### HOME SCREEN (`(tabs)/index.tsx`)

```
┌──────────────────────────────────────────────┐
│  Hello Chris 👋              [Avatar] [⚙]    │  ← greeting + avatar + settings icon
├──────────────────────────────────────────────┤
│  CONTINUE WATCHING                           │  ← section label (uppercase, small)
│  ┌────────────────────────────────────────┐  │
│  │  [Full-width poster backdrop image]    │  │  ← large landscape card (~220px tall)
│  │       [▶ Play button overlay]          │  │     poster fills card, play button centered
│  │  DUNE                                 │  │
│  │  Part Two · S1 E4                     │  │     title + season/episode
│  │  ████████████░░░░░  72%  2h 34m left  │  │     progress bar + percentage + time
│  └────────────────────────────────────────┘  │
│                                              │
│  BECAUSE YOU WATCHED INTERSTELLAR            │  ← personalized section label
│  [Card] [Card] [Card] [Card] →              │  ← horizontal scroll, portrait cards
│                                              │     (poster + title + small metadata)
│  TRENDING THIS WEEK                          │  ← section label
│  [Card] [Card] [Card] [Card] →              │  ← horizontal scroll, landscape cards
│                                              │     (poster + title)
│                                              
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│  ← floating pill tab bar
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: stat dashboard (total/movies/shows), collections row, favorites row, "Pick for Me", continue watching list, recent activity list, quick links
- Add: greeting header with avatar, continue watching hero card with poster backdrop + play overlay + progress bar, recommendation row, trending row
- Data: still uses `getInProgress()`, `getFavorites()`, needs new "trending" query

---

### DISCOVER SCREEN (`(tabs)/search.tsx`)

```
┌──────────────────────────────────────────────┐
│  Discover                                    │
│  ┌──────────────────────────────┐ [Filter]   │  ← search bar with magnifying glass
│  │ 🔍 Search movies, series...  │     icon   │     + filter icon (right)
│  └──────────────────────────────┘             │
│  [Movies] [Series] [Anime] [People] →        │  ← horizontal filter chips
│                                              │
│  TRENDING                                    │  ← section label
│  [Card] [Card] [Card] [Card] →              │  ← horizontal scroll landscape cards
│                                              │     (poster + title overlay)
│  EXPLORE BY                                  │  ← section label
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  ← 4 square icon buttons
│  │Genre │ │Years │ │Studio│ │Actor ││       │     (icon + label, grid)
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│  NEW & POPULAR                               │  ← section label
│  ┌────────────────────────────────────────┐  │
│  │ [Poster] Title · Year · Rating         │  │  ← vertical list, landscape cards
│  └────────────────────────────────────────┘  │     (poster + metadata)
│  ┌────────────────────────────────────────┐  │
│  │ [Poster] Title · Year · Rating         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Rename: "Search" → "Discover"
- Remove: status chips row, tag filter chips, results label, flat list of MediaCards
- Add: magnifying glass icon, filter icon, "Trending" section with cards, "Explore by" 4-button grid, "New & Popular" vertical list
- Data: needs trending/popular queries from recommendation engine

---

### LIBRARY SCREEN (`(tabs)/library.tsx`)

```
┌──────────────────────────────────────────────┐
│  My Library                                  │
│  [All] [Movies] [Series] [Anime]             │  ← horizontal filter tabs (segmented)
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ [Poster] │ │ [Poster] │ │ [Poster] │       │  ← 3-column grid
│  │ Title    │ │ Title    │ │ Title    │       │     (poster portrait + title)
│  └─────────┘ └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ [Poster] │ │ [Poster] │ │ [Poster] │       │
│  │ Title    │ │ Title    │ │ Title    │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│  ...                                         │
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: grid/list toggle, sort row, count header
- Change: 2 columns → 3 columns
- Change: icon placeholder → real poster image (or better placeholder)
- Simpler: just filter tabs + grid, no sort controls

---

### INSIGHTS SCREEN (`(tabs)/stats.tsx`)

```
┌──────────────────────────────────────────────┐
│  Insights                                    │
│  [Overview] [Monthly] [Yearly]               │  ← segmented period selector
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  ← 3 stat cards
│  │   24      │ │   16     │ │ 12h 45m  │    │     (number + label)
│  │ Watched   │ │ Episodes │ │Watch Time│    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  YOUR ACTIVITY                               │  ← section label
│  ┌────────────────────────────────────────┐  │
│  │ [GitHub-style heatmap calendar grid]   │  │  ← 7 rows x ~52 columns
│  │  Jan Feb Mar ... Nov Dec               │  │     each cell = 1 day
│  └────────────────────────────────────────┘  │
│                                              │
│  TOP GENRES                                  │  ← section label
│  Sci-Fi  ████████████████░░░░  35%           │  ← horizontal bar chart
│  Drama   ████████████░░░░░░░  28%           │     with percentage labels
│  Action  ████████░░░░░░░░░░  20%           │
│                                              │
│  ┌──────────────────┐                        │  ← completion ring
│  │     ╭──────╮     │                        │     (circular progress)
│  │    │  61%  │     │                        │     percentage in center
│  │     ╰──────╯     │                        │
│  │   Completion      │                        │
│  └──────────────────┘                        │
│                                              │
│  Streak  27 days 🔥🔥🔥🔥🔥                  │  ← streak + fire emojis
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: 2x2 summary grid, bar charts for genre/monthly/rating, plain streak cards
- Add: segmented period selector, 3-card stat row, GitHub heatmap calendar, horizontal bar chart with percentages, circular completion ring, fire emoji streak
- Data: heatmap data already exists in `stats-engine.ts` (`getTimelineHeatmapData`)

---

### YOU/PROFILE SCREEN (`(tabs)/settings.tsx`)

```
┌──────────────────────────────────────────────┐
│  ┌──────────┐                                │
│  │ [Avatar] │  Chrisphers Orina             │  ← large avatar + name
│  └──────────┘  Premium Explorer  ⭐          │  ← subtitle + star badge
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  ← 3 stat cards
│  │   487     │ │   124    │ │    89    │    │
│  │ Watched   │ │In-Progress│ │Plan to   │    │
│  │           │ │          │ │Watch     │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  👤  Profile                    ›            │  ← menu items: icon + label + chevron
│  🎨  Themes                     ›            │
│  💾  Backup & Sync              ›            │
│  🏆  Achievements               ›            │
│  📋  History                    ›            │
│  ⚙   Settings                  ›            │
│  🔒  App Lock                   On           │  ← with status badge
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: all toggle-based settings sections, theme swatch grid, inline PIN setup
- Add: avatar+name+subtitle hero, 3 stat cards, icon+label+chevron menu list
- Settings items become navigation to bottom sheets or sub-screens
- "Profile" becomes its own menu item (currently a modal from settings)
- "Themes" opens a bottom sheet (currently inline in settings)
- "App Lock" has a status badge "On"/"Off"

---

### MEDIA DETAIL (`media/[id].tsx`)

```
┌──────────────────────────────────────────────┐
│  [← Back]                          [🔖]      │  ← back arrow + bookmark icon
│  ┌────────────────────────────────────────┐  │
│  │  [Full-width hero/backdrop image]      │  │  ← ~300px tall hero image
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│  ┌──────────┐                               │
│  │ [Poster] │  Interstellar                │  ← poster overlapping hero bottom
│  │  ~120px  │  2014 · 2h 49m · PG-13      │     title to the right
│  └──────────┘  ⭐⭐⭐⭐⭐  4.6              │     year/duration/rating + star rating
│                                              │
│  [Sci-Fi] [Adventure] [Drama]               │  ← genre tags
│                                              │
│  [▶ Play         ] [+] [♡] [↗]             │  ← action buttons row
│  [filled, primary]                           │     play is wide, others square
│                                              │
│  [Overview] [Cast] [Reviews] [More]         │  ← tab bar
│                                              │
│  Overview tab:                               │
│  A team of explorers travel through a        │  ← description text
│  wormhole in space...                        │
│                                              │
│  Progress                                    │  ← section label
│  ████████████░░░░░░  72%                    │  ← progress bar + percentage
│  Watched on Apr 24, 2025                     │  ← watch date
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: plain icon hero, text-only back/edit links, reaction row (4 buttons), notes section, review/edit/delete row
- Add: real hero image with poster overlap, bookmark icon, star rating display, Play/Add/Heart/Share action buttons, tabbed content (Overview/Cast/Reviews/More), progress section with date
- Edit/Review become accessible from "More" tab or long-press
- Cast tab: horizontal scroll of actor cards
- Reviews tab: list of user reviews

---

### SERIES DETAIL (currently `series/[id]`, merges into media detail)

```
┌──────────────────────────────────────────────┐
│  [← Back]                          [🔖]      │
│  ┌────────────────────────────────────────┐  │
│  │  [Hero image]                          │  │
│  │                    The Witcher          │  ← title overlay on hero
│  └────────────────────────────────────────┘  │
│  2019 · 3 Seasons · Fantasy, Action · ⭐ 4.5│  ← metadata
│                                              │
│  [Seasons] [Episodes] [About]               │  ← tab bar
│                                              │
│  Seasons tab:                                │
│  [Season 1] [Season 2] [Season 3] →         │  ← horizontal season buttons
│                                              │
│  Episodes tab:                               │
│  ┌────────────────────────────────────────┐  │
│  │ 1. The End's Beginning    60m    [✅]  │  ← episode list items
│  │ 2. Four Marks             60m    [✅]  │     number + title + duration
│  │ 3. Betrayer Moon          60m    [⬜]  │     + checkbox
│  │ 4. Of Banquets, Bastards… 60m    [⬜]  │
│  │ 5. Bottled Appetites      60m    [⬜]  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Merged into media detail (no separate series route)
- Hero image with title overlay
- Horizontal season selector (currently collapsible sections)
- Episode list with checkboxes (currently separate screens per season/episode)
- Episode detail becomes a bottom sheet or inline expand

---

### CALENDAR (`calendar.tsx`)

```
┌──────────────────────────────────────────────┐
│  [← Back]  Calendar                          │
│                                              │
│  [←]         May 2025         [→]            │  ← month navigation
│                                              │
│  Mon Tue Wed Thu Fri Sat Sun                 │  ← weekday headers
│  ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐       │
│  │   ││   ││   ││   ││   ││   ││   │       │  ← date cells
│  └───┘└───┘└───┘└───┘└───┘└───┘└───┘       │     today = circle highlight
│  ┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐┌───┐       │     selected = filled
│  │ 6 ││ 7 ││ 8 ││ 9 ││10 ││11 ││12 │       │
│  └───┘└───┘└───┘└───┘└───┘└───┘└───┘       │
│  ...                                         │
│                                              │
│  May 24, 2025                                │  ← selected date label
│  ┌────────────────────────────────────────┐  │
│  │ 🎬 Watched Interstellar               │  │  ← entry list
│  │           ⭐⭐⭐⭐⭐                    │  │     icon + title + rating
│  │ 🎬 Watched 2 Episodes                  │  │
│  │    The Witcher S2E4-S3E5               │  │
│  │ 📝 Review Added                        │  │
│  │    Dune: Part Two                      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: memory capsule modal, mood/platform/device inputs, monthly summary bars
- Add: cleaner event list with icons + ratings, simpler day detail
- Calendar grid stays similar, day events become the primary content

---

### TIMELINE (`timeline.tsx`)

```
┌──────────────────────────────────────────────┐
│  [← Back]  Timeline                          │
│                                              │
│  [←]         2025         [→]               │  ← year navigation
│                                              │
│  Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec │  ← month labels
│  ┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐    │
│  │ ││ ││ ││ ││ ││ ││ ││ ││ ││ ││ ││ │    │  ← heatmap cells
│  └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘    │     (7 rows x 52 cols)
│  ...                                         │
│                                              │
│  Less [□ ▪ ▪ ■ ■] More                     │  ← legend
│                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  ← 3 stat cards
│  │    27     │ │    12    │ │   124    │    │
│  │ Longest   │ │ Current  │ │  Total   │    │
│  │ Streak    │ │ Streak   │ │ Watched  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: year chip row (replaced by navigation arrows)
- Add: month label headers on heatmap, 3 stat cards at bottom
- Heatmap already exists in code

---

### ACHIEVEMENTS (`achievements.tsx`)

```
┌──────────────────────────────────────────────┐
│  [← Back]  Achievements                      │
│                                              │
│  23 / 48 Unlocked                            │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░  │  ← overall progress bar
│                                              │
│  ┌──────────┐ ┌──────────┐                  │  ← 2-column grid
│  │  [🏅]    │ │  [🐦]    │                  │     each card:
│  │Marathoner│ │Early Bird│                  │     icon in circle
│  │Watch 10  │ │Add 30    │                  │     title + description
│  │seasons   │ │items     │                  │
│  └──────────┘ └──────────┘                  │
│  ┌──────────┐ ┌──────────┐                  │
│  │  [🦉]    │ │  [⭐]    │                  │
│  │Night Owl │ │First Step│                  │
│  │Watch at  │ │Add your  │                  │
│  │night     │ │first item│                  │
│  └──────────┘ └──────────┘                  │
│  ...                                         │
│                                              │
│  [ View All Achievements ]                   │  ← wide button
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: per-category grouped sections
- Add: overall progress bar at top, 2-column grid layout, "View All" button
- Keep: progress bars per achievement, locked/unlocked states

---

### COLLECTIONS (`collections/index.tsx`)

```
┌──────────────────────────────────────────────┐
│  [← Back]  Collections                       │
│                                              │
│  [Manual] [Smart]                            │  ← toggle tabs at top
│                                              │
│  ┌────────────────┐ ┌────────────────┐      │  ← 2-column grid
│  │  [Cover image]  │ │  [Cover image]  │      │     collection card:
│  │  Marvel Universe│ │  Best Anime     │      │     cover image + name
│  │  38 items       │ │  64 items       │      │     + item count
│  └────────────────┘ └────────────────┘      │
│  ┌────────────────┐ ┌────────────────┐      │
│  │  [Cover image]  │ │  [Cover image]  │      │
│  │  Sci-Fi Classics│ │  Completed      │      │
│  │  53 items       │ │  65 items       │      │
│  └────────────────┘ └────────────────┘      │
│                                              │
│  [ + New Collection ]                        │  ← wide primary button
│                                              │
│  ══════════════════════════════════════════  │
│  [Home] [Discover] [Library] [Insights] [You]│
└──────────────────────────────────────────────┘
```

**What changes from current:**
- Remove: list view, chevron items
- Add: Manual/Smart toggle at top, 2-column grid of collection cards with cover images
- "New Collection" becomes a full-width button at bottom

---

### FLOATING TAB BAR

```
         ╭─────────────────────────────────────╮
         │  🏠     🔍     📚     📊     👤   │  ← 5 icon+label items
         │ Home Discover Library Insights You  │     pill shape
         ╰─────────────────────────────────────╯     rounded corners (~28px)
                                                     floating ~20px from bottom
                                                     subtle shadow
                                                     active: icon + label visible
                                                     inactive: icon only (dimmed)
```

**Implementation:**
- Rendered at root level (not inside each tab screen)
- Uses `usePathname()` to determine active tab
- Animated transitions between tabs
- Glass/blur background effect

---

## New components to create

| Component | Purpose | Used in |
|-----------|---------|---------|
| `FloatingTabBar` | Pill-shaped bottom navigation | Root layout |
| `GreetingHeader` | "Hello {name}" + avatar + settings icon | Home |
| `ContinueWatchingCard` | Large landscape card with poster + progress | Home |
| `RecommendationRow` | Horizontal scroll of portrait cards | Home, Discover |
| `TrendingRow` | Horizontal scroll of landscape cards | Home, Discover |
| `ExploreByGrid` | 4-button grid (Genres/Years/Studios/Actors) | Discover |
| `StatCard` | Number + label card | Insights, Profile |
| `HeatmapCalendar` | GitHub-style activity grid | Insights, Timeline |
| `CompletionRing` | Circular progress indicator | Insights |
| `StreakBadge` | Streak number + fire emojis | Insights |
| `HorizontalBarChart` | Genre bars with percentages | Insights |
| `ProfileHero` | Avatar + name + subtitle + badge | Profile/You |
| `MenuListItem` | Icon + label + chevron row | Profile/You |
| `MediaDetailHero` | Full-width hero + overlapping poster | Detail |
| `StarRating` | 5-star display with number | Detail |
| `ActionButtonRow` | Play + icon buttons | Detail |
| `ContentTabs` | Overview/Cast/Reviews/More tabs | Detail |
| `SeasonSelector` | Horizontal season buttons | Series detail |
| `EpisodeListItem` | Number + title + duration + checkbox | Series detail |
| `CollectionCard` | Cover image + name + count | Collections |
| `AchievementCard` | Icon + title + description + progress | Achievements |
| `FilterSegmentedTabs` | Segmented control tabs | Library, Insights |
| `MediaGridCard` | Poster + title (for 3-col grid) | Library |
| `SearchBar` | Magnifying glass + input + filter icon | Discover |

---

## Components to remove/replace

| Current | Replacement |
|---------|-------------|
| `GlassCard` (used everywhere) | Still used, but fewer places. Most sections become dedicated components |
| `ThemedText` type="display" (big numbers) | `StatCard` component |
| Home stat dashboard | `ContinueWatchingCard` + `RecommendationRow` |
| Home quick-links row | Removed (available via tab bar + profile menu) |
| Search flat list results | `TrendingRow` + `ExploreByGrid` + `NewAndPopularList` |
| Library sort controls | `FilterSegmentedTabs` |
| Settings toggle sections | `MenuListItem` navigation |
| Media detail reaction row | `StarRating` display + `ActionButtonRow` |
| Series collapsible seasons | `SeasonSelector` horizontal scroll |
| Achievement category sections | Flat 2-column grid |

---

## Data flow changes

| Need | Current source | Action |
|------|---------------|--------|
| Greeting (time-based) | None | New utility in `format.ts` |
| Trending items | `recommendation-engine.ts` (`getTopRated`) | Wire to Discover + Home |
| Recommended for you | `recommendation-engine.ts` (`getSimilarByType`) | Wire to Home |
| New & popular | `recommendation-engine.ts` (`getRecentlyAdded`) | Wire to Discover |
| Explore by genre/year/studio/actor | `fuzzy-search.ts` + DB queries | New query functions |
| Completion percentage | `stats-engine.ts` (`getLibraryStats`) | Already exists |
| Activity heatmap | `stats-engine.ts` (`getTimelineHeatmapData`) | Already exists |
| Profile stats (watched/in-progress/plan) | `db/queries/media.ts` (`getMediaCounts`) | Already exists |
| Collection covers | `collections.coverPath` field exists | Populate in collection queries |

---

## Files to create (new)

```
src/components/floating-tab-bar.tsx
src/components/greeting-header.tsx
src/components/continue-watching-card.tsx
src/components/recommendation-row.tsx
src/components/trending-row.tsx
src/components/explore-by-grid.tsx
src/components/stat-card.tsx
src/components/heatmap-calendar.tsx
src/components/completion-ring.tsx
src/components/streak-badge.tsx
src/components/horizontal-bar-chart.tsx
src/components/profile-hero.tsx
src/components/menu-list-item.tsx
src/components/media-detail-hero.tsx
src/components/star-rating.tsx
src/components/action-button-row.tsx
src/components/content-tabs.tsx
src/components/season-selector.tsx
src/components/episode-list-item.tsx
src/components/collection-grid-card.tsx
src/components/achievement-grid-card.tsx
src/components/filter-segmented-tabs.tsx
src/components/media-grid-card.tsx
src/components/search-bar.tsx
```

## Files to modify

```
src/app/_layout.tsx              → add FloatingTabBar, remove tab group dependency
src/app/(tabs)/_layout.tsx       → simplify to Slot, render FloatingTabBar
src/app/(tabs)/index.tsx         → complete rewrite (greeting + hero + rows)
src/app/(tabs)/search.tsx        → rewrite (Discover + trending + explore)
src/app/(tabs)/library.tsx       → rewrite (3-col grid + filter tabs)
src/app/(tabs)/stats.tsx         → rewrite (Insights + heatmap + ring)
src/app/(tabs)/settings.tsx      → rewrite (You/Profile + menu list)
src/app/media/[id].tsx           → rewrite (hero + poster overlap + tabs)
src/app/calendar.tsx             → restyle
src/app/timeline.tsx             → restyle
src/app/achievements.tsx         → rewrite (grid + progress bar)
src/app/collections/index.tsx    → rewrite (toggle + grid)
src/components/app-tabs.tsx      → delete (replaced by FloatingTabBar)
src/components/app-tabs.web.tsx  → delete (replaced by FloatingTabBar)
```

## Files to delete

```
src/app/series/[id]/index.tsx              → merged into media/[id]
src/app/series/[id]/season/[seasonNumber].tsx  → merged into media/[id]
src/app/series/[id]/episode/[episodeId].tsx    → becomes bottom sheet
src/app/history.tsx                        → merged into Calendar/Insights
src/app/collections/[id]/edit.tsx          → becomes bottom sheet
src/app/media/[id]/edit.tsx                → becomes bottom sheet
src/app/media/[id]/review.tsx              → becomes bottom sheet
src/app/tags/index.tsx                     → merged into Discover/Library filter
src/components/app-lock-guard.tsx          → simplified
src/components/lock-screen.tsx             → simplified
```

---

## Implementation priority

### Phase 1: Foundation (do first) ✅ DONE
1. Create `FloatingTabBar` component ✅
2. Create base UI primitives: `StatCard`, `FilterSegmentedTabs`, `SearchBar`, `MenuListItem` ✅
3. Restructure `(tabs)/_layout.tsx` to use floating bar ✅
4. Create `GreetingHeader` ✅

### Phase 2: Home screen ✅ DONE
5. Create `ContinueWatchingCard` ✅
6. Create `RecommendationRow` + `TrendingRow` ✅
7. Rewrite `(tabs)/index.tsx` ✅

### Phase 3: Core screens ✅ DONE
8. Rewrite `(tabs)/search.tsx` → Discover ✅
9. Rewrite `(tabs)/library.tsx` → 3-col grid ✅
10. Rewrite `(tabs)/stats.tsx` → Insights ✅
11. Create `HeatmapCalendar`, `CompletionRing`, `HorizontalBarChart` (inline in Insights)

### Phase 4: Profile & detail ✅ DONE
12. Rewrite `(tabs)/settings.tsx` → You/Profile ✅
13. Create `ProfileHero`, `MenuListItem` (integrated into profile screen)
14. Rewrite `media/[id].tsx` with hero + poster overlap + tabs ✅
15. Create `MediaDetailHero`, `StarRating`, `ActionButtonRow`, `ContentTabs` (integrated into detail screen)

### Phase 5: Secondary screens ✅ DONE
16. Rewrite `achievements.tsx` (2-col grid layout) ✅
17. Rewrite `collections/index.tsx` (2-col grid + icon header) ✅
18. Restyle `calendar.tsx` (clean nav, activity dots, icon back) ✅
19. Restyle `timeline.tsx` (icon back, clean streaks, heatmap) ✅
20. ~~Merge series detail into media detail~~ (already handled in Phase 4)

### Phase 6: Polish ✅ DONE
21. ~~Add parallax to hero images~~ (placeholder icons, no real images yet)
22. Add micro-interactions (press-scale, haptics) ✅
23. Add glass effects to floating tab bar ✅ (already had glass + spring animations)
24. Test all screens, fix layout issues ✅ (typecheck clean)

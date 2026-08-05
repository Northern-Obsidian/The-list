# NextWatch (The_List) — Full App Structure

> Purpose of this doc: map the entire implemented app so a new UI can be designed against
> the real structure. It reflects the **actual code** in `src/`, not aspirational specs.
> Related docs: `plan/` (implementation plan) and `design/` (UI/UX Pro Max design system).

---

## 1. Overview

Offline-first entertainment tracker built with **Expo SDK 56** + **Expo Router**.
All data lives in a local **SQLite** database (Drizzle ORM). No backend, no accounts
(optional Google Drive backup only). Multi-profile capable.

| Stack piece        | Choice |
|--------------------|--------|
| Framework          | Expo SDK 56 / React Native 0.85 / React 19.2 |
| Navigation         | Expo Router (file-based) + NativeTabs (native tab bar, custom web tab bar) |
| Database           | `expo-sqlite` + `drizzle-orm` (sync queries) |
| Preferences        | In-memory store (`useSyncExternalStore`) — NOT persisted to disk currently |
| Theming            | React Context + 8 themes (`system/light/dark/amoled/glass/cyberpunk/neon/minimal`) |
| Icons              | `@tabler/icons-react-native` (web) + SF Symbols / Material (native tabs), custom `Icon` wrapper |
| Animation          | `react-native-reanimated` 4 |
| Native UI          | `expo-glass-effect` (GlassCard), `@expo/ui` available |
| Notifications      | `expo-notifications` + `expo-background-fetch` + `expo-task-manager` |
| Security           | `expo-local-authentication` + PIN via SecureStore |
| App Lock / Widget  | `app-lock-service`, `widget-service` (Android widget via `plugins/with-android-widget.js`) |

---

## 2. Directory map

```
src/
├── app/                    # Expo Router routes (every file = a screen)
│   ├── _layout.tsx         # Root stack + providers + DB bootstrap + splash
│   ├── index.tsx           # Redirector → onboarding or (tabs)
│   ├── (tabs)/             # Bottom-tab group (5 tabs)
│   │   ├── _layout.tsx     # → <AppTabs/>
│   │   ├── index.tsx       # Home
│   │   ├── search.tsx      # Search
│   │   ├── library.tsx     # Library
│   │   ├── stats.tsx       # Statistics
│   │   └── settings.tsx    # Settings
│   ├── onboarding/         # Onboarding flow (4 slides, image collage)
│   ├── media/              # Movie/Show/… detail + add/edit/review (modals)
│   ├── series/             # Series detail → season → episode progress
│   ├── collections/        # Manual + smart collections
│   ├── tags/               # Tag list + per-tag items
│   ├── profile/            # Profile management (modal)
│   ├── calendar.tsx        # Monthly calendar + memory capsules
│   ├── timeline.tsx        # GitHub-style activity heatmap
│   ├── achievements.tsx    # Achievement gallery
│   ├── history.tsx         # Watch history log
│   ├── backup.tsx          # Export/restore + Google Drive
│   └── import.tsx          # Import JSON/CSV
│
├── components/
│   ├── ui/                 # Reusable primitives (see §5)
│   ├── media/              # MediaCard, MediaForm, QuickAddForm
│   ├── collections/        # CollectionForm, RuleBuilder, RuleRow
│   ├── review/             # ReviewForm
│   ├── profile/            # ProfileForm
│   ├── onboarding/         # OnboardingSlide, ImageGrid
│   ├── app-tabs.tsx        # NATIVE tab bar (SF Symbols / Material)
│   ├── app-tabs.web.tsx    # WEB tab bar (custom pill, Reanimated)
│   ├── themed-text.tsx / themed-view.tsx   # Theme-aware text/view
│   ├── glass-card.tsx      # Glassmorphism card (expo-glass-effect / web fallback)
│   ├── lock-screen.tsx / app-lock-guard.tsx
│   ├── error-boundary.tsx, animated-list.tsx, animated-icon.tsx, hint-row.tsx
│   └── watch-provider-links.tsx
│
├── db/
│   ├── index.ts            # DB open + migration runner + active-profile cache
│   ├── schema/             # 14 table definitions
│   ├── migrations/         # Hand-written SQL migrations array
│   └── queries/            # Prepared query helpers (media, tags, collections, series, watch-history)
│
├── services/               # Feature engines & integrations (see §6)
├── stores/
│   └── use-preference-store.ts   # In-memory settings store + React hooks
├── contexts/
│   └── theme-context.tsx   # ThemeProvider
├── hooks/                  # use-theme, use-haptics, use-drizzle, use-color-scheme
├── constants/              # theme.ts (colors/fonts/spacing), shadows.ts, watch-providers.ts
├── types/                  # media.ts, collections.ts
├── utils/                  # format, validation, generate-id, dynamic-colors, performance, micro-interactions
└── global.css              # Web font variables (Poppins / Righteous)
```

---

## 3. Navigation tree (all routes)

Root `_layout.tsx` is a `Stack` (headers hidden). Modal screens slide up;
detail screens slide in from the right; onboarding/tabs fade.

```
index                        → redirect (onboarding_completed key in expo-sqlite/kv-store)
onboarding/
  index                      → 4-slide pager
(tabs)  ← main shell
  index       Home
  search      Search
  library     Library
  stats       Statistics
  settings    Settings
media/new        MODAL   → picker → quick-add → full form
media/[id]               → detail (reactions, watch links, delete)
media/[id]/edit   MODAL  → MediaForm pre-filled
media/[id]/review MODAL  → ReviewForm
series/[id]               → progress + collapsible seasons
series/[id]/season/[seasonNumber] → episode checklist
series/[id]/episode/[episodeId]   → episode detail (rating/notes/fav)
collections                → list of collections
collections/new   MODAL   → CollectionForm
collections/[id]           → items in collection (manual or smart)
collections/[id]/edit MODAL
tags                       → tag CRUD
tags/[id]                  → items for a tag
profile/index     MODAL   → ProfileForm
calendar                   → month grid + day history + memory capsule modal
timeline                   → year heatmap + streaks
achievements               → achievement gallery
history                    → watch-history log + edit modal
backup             MODAL   → export/import/Drive
import             MODAL   → JSON/CSV import
```

Navigation state is fully manual: screens call `router.push/back/replace` and reload
data with `useFocusEffect`/`useEffect` — there is no global store for library data.

### Tab bar
- **Native** (`app-tabs.tsx`): `expo-router/unstable-native-tabs` → `NativeTabs` with
  `NativeTabs.Trigger` (SF Symbols + Material icons). Home uses `house`, Search
  `magnifyingglass`, Library `books.vertical`, Stats `chart.bar`, Settings `gearshape`.
- **Web** (`app-tabs.web.tsx`): `expo-router/ui` `Tabs` with a floating pill tab bar
  (Reanimated press-scale + focus tint).

---

## 4. Database schema (14 tables)

All IDs are text (`generateId()`). Timestamps stored as ISO strings. Every table
references `profiles` and cascades on profile delete.

| Table              | Purpose & key fields |
|--------------------|----------------------|
| `profiles`         | `name`, `avatar`, `isActive`, `pin`, `isGuest` |
| `media`            | Core item. `mediaType` (14 enums), `title`, `status` (6 enums), `overview`, `year`, `runtime`, `genres` (JSON string), `studio`, `country`, `language`, `director` (CSV string), `actors` (CSV string), `personalRating`, `favorite`, `rewatchCount`, `notes`, `tags`, `collectionIds`, `customFields`, `importedFrom` |
| `series`           | 1:1 with media for series-types: `totalSeasons`, `totalEpisodes`, `completedEpisodes`, `currentSeason`, `currentEpisode`, `airStatus`, dates |
| `seasons`          | per series: `seasonNumber`, `episodeCount`, `completedEpisodes`, `title`, `overview`, `posterPath`, `airDate`, `isFiller`. Unique (series, seasonNumber) |
| `episodes`         | per season: `episodeNumber`, `title`, `overview`, `runtime`, `airDate`, `watched`, `watchDate`, `personalRating`, `notes`, `favorite`, `isFiller`, `isSpecial`, `isRecap` |
| `collections`      | `name`, `description`, `coverPath`, `color`, `icon`, `isSmart`, `smartRules` (JSON), `sortOrder` |
| `media_collections`| M:N join: `mediaId` + `collectionId` + `addedAt` |
| `tags`             | `name`, `color` (hex) |
| `media_tags`       | M:N join: `mediaId` + `tagId` |
| `watch_history`    | `mediaId`, `episodeId?`, `watchedAt` (date string), `durationMinutes`, `note`, `watchedWith`, `mood`, `platform`, `device` |
| `reviews`          | `title`, `content`, `isSpoiler`, `favoriteScene`, `quotes` |
| `ratings`          | `score` + 4 boolean reactions: `heart`, `thumbsUp`, `masterpiece`, `needRewatch` |
| `achievements`     | `key`, `title`, `description`, `icon`, `unlockedAt`, `progressCurrent`, `progressTarget`, `isSecret` |
| `backups`          | `version`, `fileSize`, `checksum`, `driveFileId`, `createdAt`, `restoredAt` |
| `preferences`      | per-profile `key` / `value` rows (DB-persisted, currently unmirrored to the in-memory store) |

### Data-fetch pattern
Screens open the DB with `getDatabase()`, run **synchronous** Drizzle `.all()/.get()/run()`
directly, and hold results in local `useState`. `useFocusEffect` re-queries on focus
(so modal edits show up when you go back). There is no React Query / SWR.

---

## 5. UI component system

### Primitives (`components/ui/` — exported from `ui/index.ts`)
`Avatar` `Badge` `Button` `Card` `Chip` `Collapsible` `Divider` `EmptyState`
`IconButton` `Input` `Modal` `ProgressBar` `Screen` `ScreenLoader` `Skeleton`
`TagPicker` `BarChart` `Icon` (+ `iconForMediaType`, `MEDIA_TYPE_ICONS`, `COLLECTION_ICONS`)

### Themed primitives (used everywhere)
- `ThemedText` — text with typography variants: `display, title, subtitle, h2, body,
  smallBold, small, label, caption, link` + `themeColor` props.
- `ThemedView` — View that can render as `backgroundSecondary/Tertiary/Element/Selected`
  surface variants.
- `GlassCard` — `expo-glass-effect` GlassView on iOS/Android, translucent fallback on web.

### Feature components
- `media/MediaCard` (`variant: 'grid' | 'list'`) — poster placeholder icon + title +
  meta + status dot; press-scale via `useScalePress`. Memoized.
- `media/MediaForm` — the big add/edit form (fields for every `media` column +
  series fields + tags + collections).
- `media/QuickAddForm` — minimal add (title + type + status).
- `collections/CollectionForm` + `RuleBuilder`/`RuleRow` — smart-rule builder.
- `review/ReviewForm`, `profile/ProfileForm`, `onboarding/OnboardingSlide`+`ImageGrid`,
  `watch-provider-links.tsx`.

### Screen scaffolding pattern (repeated on every screen)
- `useSafeAreaInsets()` for top padding; `BottomTabInset` + `Spacing.three` for bottom.
- `MaxContentWidth = 800` centered `ScrollView`/`FlatList` for web.
- Header = `<Back link> <Title> <Action link>` row.
- Every screen wrapped in `<ErrorBoundary name="…">`.

---

## 6. Services (feature engines)

| Service | Responsibility |
|---------|----------------|
| `stats-engine.ts` | Library totals, genre distribution, monthly activity, streaks, rating distribution, year heatmap |
| `progress-engine.ts` | Series/season/episode progress, mark watched/unwatched, next-unwatched, episode rating/notes/favorite |
| `recommendation-engine.ts` | Top rated, recently added, favorites, similar-by-type, unwatched picks |
| `random-picker.ts` | `pickRandom` (dice) |
| `smart-collection-engine.ts` | Evaluate smart rules against media; refresh collections |
| `achievement-engine.ts` | Definition + unlock check + per-profile stats |
| `watch-provider-service.ts` | Watch links (Netflix/Hulu/…) stored in `customFields`; `openWatchLink` |
| `fuzzy-search.ts` | Fuzzy text search over library (threshold 0.15, title/genres/type) |
| `notification-service.ts` + `background-task-service.ts` | Permission, channels, background fetch, reminder scheduling (continue/daily goal/weekly/streak/backup/release) |
| `app-lock-service.ts` | Biometric auth, PIN set/verify/remove (SecureStore) |
| `backup-service.ts` | Full JSON export/import, backup history, size |
| `drive-service.ts` | Google Drive sign-in (OAuth via `expo-auth-session`), upload/download/list |
| `export-service.ts` | Export options + PDF |
| `import-service.ts` | JSON + CSV import |
| `widget-service.ts` | Android home-screen widget data |

---

## 7. State & settings

- **Theme**: `ThemeProvider` (context) reads `useThemePreference()` from the store,
  resolves `system` against `useColorScheme()`, returns a `ThemeColors` object
  (`useTheme()` hook). 8 themes in `constants/theme.ts`.
- **Preferences store**: `use-preference-store.ts` — a tiny in-memory store driven by
  `useSyncExternalStore`. Hooks: theme, app lock, biometric, notifications & reminder
  toggles, dark-mode override, default view, ratings, compact mode, haptics, auto-play,
  skip intros, playback quality, language, auto backup, cache size. **Note:** values are
  in-memory only (not yet persisted).
- **Active profile**: cached in `db/index.ts` (`getActiveProfileId`). Switching profiles
  in Settings re-queries everything.

---

## 8. Settings screen sections (the single biggest screen)

1. **General** — Compact, Ratings, Haptics, Default View
2. **Appearance** — 8 theme swatches
3. **Profiles** — switch profile / Manage Profiles
4. **Security** — App Lock, Biometric, Remove PIN (inline PIN setup form)
5. **Notifications** — master toggle + Continue, Daily Goal, Weekly, Streaks, Backup, Releases
6. **Playback** — Auto-Play, Skip Intros, Quality
7. **Language** — 6 languages
8. **Data** — Auto Backup, Backup & Restore, Import, Clear Cache
9. **About** — Help, About, Reset Data, version

---

## 9. What the current UI actually looks like (for a redesign brief)

- **Style today**: functional, card-based, rose/red primary (`#E11D48`) on pink/black
  backgrounds, `GlassCard` surfaces, uppercase small-caps section titles, plain
  `Pressable` rows with opacity feedback, emoji used as icons in several places
  (library empty state, episode checkboxes ✅/⬜, series hero 📺, tag 📚).
- **Posters**: no real image rendering yet — `MediaCard` shows a type icon on a
  colored placeholder block (`posterPath`/`backdropPath` fields exist but unused).
- **Home screen** (`(tabs)/index`): big total count, 3 stat cards, horizontal
  Collections row, horizontal Favorites row, "Pick for Me" random card,
  Continue Watching list, Recent Activity list, quick-links row.
- **Detail screens** use a tall hero placeholder block + badge.
- **Reactions** on media detail: Heart / Thumbs-up / Masterpiece / Need-rewatch
  (color-coded toggle buttons).
- Web gets a floating pill tab bar; native gets standard SF/Material tabs.

---

## 10. Redesign touch-points (where new UI lands)

- **Design system**: `design/` (tokens, components, screens, navigation, modals) +
  `design-system/the-list/MASTER.md`. Style guide: "Vibrant & Block-based",
  Righteous/Poppins, rose + blue accents.
- **Primary style files**: `src/constants/theme.ts` (colors/fonts/spacing),
  `src/components/themed-text.tsx`, `themed-view.tsx`, `glass-card.tsx`,
  `src/components/ui/*`, `app-tabs.tsx` / `app-tabs.web.tsx`.
- **Screens to restyle** live in `src/app/`; each file owns its `StyleSheet`.
- **Visual gaps** a redesign can address: real poster/backdrop image support,
  consistent iconography (replace emoji), richer home dashboard, empty states,
  media detail hero, and a proper design-token-driven component library.

---

## 11. Running / checking the app

```
npm start            # Expo dev server
npm run ios/android/web
npm run lint         # eslint src/ (max 200 warnings)
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run db:generate / db:push   # drizzle-kit
```

Config: `app.json`, `metro.config.js`, `babel.config.js`, `drizzle.config.ts`,
`plugins/with-android-widget.js`, `scripts/reset-project.js`, `src/global.css` (fonts).

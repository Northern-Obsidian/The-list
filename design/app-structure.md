# NextWatch ("The List") — Full App Structure

> Living reference for UI redesign planning. Explains what the app does, every screen, the data model, theming tokens, and the architectural constraints that any new UI must fit.

---

## 1. What the app is

**NextWatch** (slug `The_List`) is a **local-first media tracking app** (movies, TV shows, anime, books, games, podcasts, etc.). Users build a personal library, mark items as watching/completed, log watch history with moods and notes, rate/review, organize with collections and tags, track series episode-by-episode, earn achievements, and see statistics/streaks/calendars. It also supports **multiple user profiles**, **app lock (PIN + biometrics)**, **local notifications**, **JSON/CSV/PDF export + import**, **Google Drive backups**, and an **Android home-screen widget**.

Key properties:

- **100% offline** — no backend. Everything lives in a local SQLite database (`the_list.db`) via `expo-sqlite` + Drizzle ORM.
- **Multi-profile** — nearly every record is scoped by `profileId`; an "active profile" acts like the logged-in user.
- **Cross-platform** — iOS, Android, and web (Expo Router + React Native). Native tabs on iOS/Android, a custom floating pill tab bar on web.
- **Themed** — 8 color themes (system/dark/light/amoled/glass/cyberpunk/neon/minimal) selectable in Settings.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Expo SDK 56, React Native 0.85, React 19.2 |
| Navigation | Expo Router (file-based routing) + NativeTabs |
| Database | `expo-sqlite` + Drizzle ORM (`drizzle-orm/expo-sqlite`) |
| State | Zustand-style external store via `useSyncExternalStore` (`src/stores/use-preference-store.ts`) + React Context for theming |
| Animations | Reanimated 4, worklets |
| Styling | RN `StyleSheet` + CSS (`global.css`) on web, token-driven colors from `src/constants/theme.ts` |
| Icons | `@tabler/icons-react-native` (via a central `Icon` wrapper) + `expo-symbols` (SF Symbols, iOS) |
| Glass effect | `expo-glass-effect` (native frosted glass) |
| Lists | `@shopify/flash-list`, `@gorhom/bottom-sheet` |
| Testing | Vitest (`npm test`), ESLint (`npm run lint`), `tsc --noEmit` |

## 3. Navigation architecture

File-based routes live in `src/app/`. The root stack (`src/app/_layout.tsx`) declares:

- **Tabs** — `(tabs)` route group with 5 tabs (fade transition).
- **Stack screens** — pushed, `slide_from_right`.
- **Modal screens** — `presentation: 'modal'`, `slide_from_bottom` (add/edit/review forms, profiles, import, backup).

### Tab bar (`src/components/app-tabs.tsx` / `app-tabs.web.tsx`)

| # | Tab | Route | iOS SF Symbol | Android | Purpose |
|---|---|---|---|---|---|
| 1 | Home | `(tabs)/index.tsx` | `house` | `home` | Library overview / dashboard |
| 2 | Search | `(tabs)/search.tsx` | `magnifyingglass` | `search` | Fuzzy search + filter chips |
| 3 | Library | `(tabs)/library.tsx` | `books.vertical` | `library_books` | Grid/list of all titles |
| 4 | Stats | `(tabs)/stats.tsx` | `chart.bar` | `bar_chart` | Charts & aggregated stats |
| 5 | Settings | `(tabs)/settings.tsx` | `gearshape` | `settings` | Preferences & config |

> Design note: Native tabs are icon-only (labels via accessibility). Web tab bar is a floating glass pill with Tabler icons.

### Full route map

```
Root Stack
├── index                    → redirect to onboarding or (tabs)
├── onboarding/index         → 4-slide welcome pager
├── (tabs)                   → 5 tabs (Home, Search, Library, Stats, Settings)
│
├── Stack screens (slide_from_right)
│   ├── media/[id]                → Media Detail
│   ├── calendar                  → Calendar of watch activity + memory capsules
│   ├── timeline                  → Yearly activity heatmap + streaks
│   ├── achievements              → Achievements (30 total, incl. secrets)
│   ├── history                   → Watch history log
│   ├── series/[id]               → Series Detail (seasons + episodes)
│   ├── series/[id]/season/[seasonNumber]   → Season Detail
│   ├── series/[id]/episode/[episodeId]     → Episode Detail
│   ├── collections/[id]          → Collection Detail
│   ├── tags/index                → Tags manager
│   └── tags/[id]                 → Tag Detail
│
└── Modal screens (slide_from_bottom)
    ├── media/new                  → Add Media (type picker → quick add → full form)
    ├── media/[id]/edit            → Edit Media
    ├── media/[id]/review          → Write Review
    ├── collections/new            → New Collection
    ├── collections/[id]/edit      → Edit Collection
    ├── profile/index              → Profiles (create/switch)
    ├── import                     → Import JSON/CSV
    └── backup                     → Backup & Restore + Drive
```

## 4. Screens & their UI (per current implementation)

### 4.1 Tab screens

#### Home — `(tabs)/index.tsx` (312 lines)
- Header: "Your Library" + `{n} items tracked`.
- Big **Total Items** number card + 3 quick-stat cards (Movies / Shows / Anime).
- Horizontal **Collections** rail ("See all").
- **Favorites** horizontal card.
- **Pick for Me** random-picker card (dice).
- **Continue Watching** (up to 5 media rows).
- **Recent Activity** (up to 5 media rows).
- Bottom quick links: Add Media / Calendar / Achievements.
- Reloads on focus. Skeleton loading states.

#### Search — `(tabs)/search.tsx` (397 lines)
- Search bar (debounced 250ms) + clear button.
- Horizontal **media-type chips** (8 types) + **status chips** (6 statuses) + **tag chips** (colored).
- Results count label, list of media rows, empty state.

#### Library — `(tabs)/library.tsx` (216 lines)
- Header + item count + **grid/list view toggle**.
- Type filter chips (All / Movies / TV Shows / Anime / Books).
- Sort-by chips (Title / Year / Rating / Recent).
- Animated 2-column grid or 1-column list. Empty state.

#### Stats — `(tabs)/stats.tsx` (152 lines)
- 2×2 summary grid (Total / Movies / Shows / Episodes watched).
- Stat blocks: Hours Watched, % Completed, Watching count.
- Streak cards: Current Day Streak / Longest Streak.
- Bar charts: Genre Distribution (top 10), Monthly Activity (6 mo), Rating Distribution.

#### Settings — `(tabs)/settings.tsx` (785 lines, largest screen)
- PIN setup card (number-pad inputs).
- **General:** Compact mode, Ratings, Haptics toggles; Default View (grid/list).
- **Appearance:** 8-theme swatch grid.
- **Profiles:** profile rows + active highlight; "Manage Profiles".
- **Security:** App Lock, Biometric, Remove PIN.
- **Notifications:** master toggle + 6 sub-toggles (Continue / Daily Goal / Weekly / Streaks / Backup / Releases).
- **Playback:** Auto-Play, Skip Intros, Quality picker.
- **Language:** picker (EN/ES/FR/DE/JA/KO).
- **Data:** Auto Backup, Backup & Restore, Import, Clear Cache.
- **About:** Help, About, Reset Data, version.

### 4.2 Stack screens

#### Media Detail — `media/[id].tsx` (265 lines)
Hero (large type icon + media-type badge), title, overview, **series progress card** + "View Series Progress" button (for series), quick-rating row (❤️ / 👍 / 🏆 / 🔄 toggles), genre badges, meta row (year/runtime/rating/air-status), director/actors, **Where to Watch** provider links, notes card, Review/Edit/Delete actions.

#### Calendar — `calendar.tsx` (400 lines)
Month grid, per-day watch entries (editable/deletable), **Memory Capsule** editor (mood emoji, platform, device, watched-with, note) via bottom sheet, monthly summary mini bar chart.

#### Timeline — `timeline.tsx` (200 lines)
GitHub-style 4-color yearly heatmap, streak cards (Day / Best / Events), year chips.

#### History — `history.tsx` (304 lines)
Chronological watch entries (title, date, duration, mood/platform, edit, delete), Quick Add link, edit-entry bottom sheet.

#### Achievements — `achievements.tsx` (173 lines)
Overall progress card ("X/Y unlocked"), grouped sections by category, per-achievement progress bars, secret ones masked "???".

#### Series Detail — `series/[id]/index.tsx` (168 lines)
Hero placeholder, overview, **series progress card** with "Continue S{n}" button, collapsible season panels (first 5 episodes each + "View All").

#### Season Detail — `series/[id]/season/[seasonNumber].tsx` (179 lines)
Progress bar, Mark All Watched/Unwatched, episode list with watch toggles + filler/special/rating meta.

#### Episode Detail — `series/[id]/episode/[episodeId].tsx` (221 lines)
Large watched toggle, overview, meta row (runtime/air date/filler/special/recap), favorite toggle, 0–10 rating input, notes, per-episode watch history.

#### Collections List — `collections/index.tsx` (106 lines)
Collection cards (icon, name, "N items · Smart" badge), Create action.

#### Collection Detail — `collections/[id].tsx` (122 lines)
Info header (icon, name, description), item list, Smart Collection tag, edit action.

#### Tags Manager — `tags/index.tsx` (292 lines)
Tag rows (color dot, name, count, edit/delete), create/edit modals with color swatch picker.

#### Tag Detail — `tags/[id].tsx` (99 lines)
Simple item list for the tag.

### 4.3 Modal screens

| Route | Purpose |
|---|---|
| `media/new.tsx` | 3-step flow: type picker (14 types) → QuickAddForm → full MediaForm |
| `media/[id]/edit.tsx` | Edit a title (seeded MediaForm) |
| `media/[id]/review.tsx` | Write review |
| `collections/new.tsx` / `[id]/edit.tsx` | Create / edit collection (incl. smart rules) |
| `profile/index.tsx` | Profiles: name + avatar emoji |
| `import.tsx` | Paste JSON or CSV, shows import result |
| `backup.tsx` | Backup size, create backup (JSON copy), Google Drive sign-in/upload/restore, restore from JSON, history |

## 5. Data model (SQLite, 15 tables)

All entities are per-profile except `profiles` itself. IDs are generated (`generateId()`). Watch statuses drive most UI: `plan_to_watch / watching / completed / paused / dropped / rewatching`. Media has 14 types (`movie, tv_show, anime, documentary, web_series, mini_series, ova, cartoon, reality_show, podcast, audiobook, book, game, drama`); `series`-related types have seasons/episodes.

| Table | Purpose | Key fields |
|---|---|---|
| `profiles` | User profiles | name, avatar, isActive, pin, isGuest |
| `media` | Central library entity | mediaType, title, overview, posterPath, runtime, year, genres(JSON), status, personalRating, favorite, rewatchCount, notes, customFields |
| `series` | 1:1 with media (episodic) | totalSeasons, totalEpisodes, completedEpisodes, currentSeason/Episode, airStatus, nextEpisodeDate |
| `seasons` | Season within a series | seasonNumber, episodeCount, completedEpisodes, isFiller |
| `episodes` | Episode tracking | episodeNumber, watched, watchDate, personalRating, notes, favorite, isFiller/isSpecial/isRecap |
| `collections` + `media_collections` | Curated groups (manual & smart) | name, isSmart, smartRules(JSON); join table |
| `tags` + `media_tags` | User labels | name, color; join table |
| `watch_history` | Watch event log (drives stats/streaks/heatmap) | mediaId, episodeId, watchedAt, durationMinutes, mood, platform, device, watchedWith |
| `reviews` | Long-form reviews | title, content, isSpoiler, favoriteScene, quotes |
| `ratings` | Numeric score + reactions | score, heart, thumbsUp, masterpiece, needRewatch |
| `achievements` | Unlocked badges | key, title, progressCurrent/Target, isSecret, unlockedAt |
| `backups` | Backup snapshot log | version, fileSize, checksum, driveFileId |
| `preferences` | Profile key/value settings | key, value |

**Design-critical notes:**
- `genres`, `director`, `actors`, `tags`, `collectionIds`, `customFields`, `smartRules`, `preferences.value` are **JSON-in-text** — must parse defensively.
- `media.tags` / `media.collectionIds` are **denormalized copies** of the join tables — keep in sync.
- "Where to watch" links live in `media.customFields.watchLinks` → `{providerId, url, label?}`.

## 6. Services (business logic) — `src/services/`

| Service | What it does |
|---|---|
| `progress-engine` | Authoritative series/episode progress: watch toggles, counters, resume position, watch-history writes |
| `stats-engine` | Library stats, genre/monthly/rating distributions, streaks, heatmap data |
| `achievement-engine` | 30 achievements; live progress; unlocks on actions |
| `smart-collection-engine` | Evaluates rule-based collections (all/any, 7 fields, 9 operators) |
| `recommendation-engine` | Genre/similarity SQL recommendations |
| `random-picker` | "What should I watch?" randomizer |
| `fuzzy-search` | Dependency-free fuzzy matcher |
| `notification-service` | Local notifications: continue-watching, daily goal, weekly summary, streak, backup, release reminders; streak calc |
| `background-task-service` | Expo background fetch + channel setup + tap deep-links |
| `backup-service` | Full DB JSON export/import + checksum + history log |
| `drive-service` | Google Drive OAuth upload/download/list |
| `export-service` | JSON / CSV / Markdown / PDF export |
| `import-service` | JSON/CSV bulk import with validation |
| `watch-provider-service` | Watch-link storage + deep-link open |
| `app-lock-service` | PIN + biometric lock (expo-secure-store) |
| `widget-service` | Android home-screen widget data |
| `achievement-engine` | (above) |

## 7. Theming & design tokens

Themes are resolved by `src/contexts/theme-context.tsx` (wraps the whole app) and consumed via `useTheme()` (returns `ThemeColors`).

- **Color roles (30+):** `text`, `background`, `backgroundSecondary/Tertiary/Element/Selected`, `textSecondary/Tertiary`, `primary/PrimaryLight/PrimaryDark`, `success/warning/error/info`, `card`, `cardElevated`, `modal`, `sheet`, `border`, `borderLight`, `overlay`, `shadow`, `tabBar`, `tabBarInactive/Active`, `skeleton`, `glass`, `glassBorder`, `blur`.
- **Fonts:** Poppins (sans/body), Righteous (heading), serif/rounded/mono variants. On web these are CSS variables.
- **Spacing scale:** `Spacing` (2 / 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96).
- **Shadows:** `Shadows.sm/md/lg/xl` (rose-tinted).
- **Constants:** `BottomTabInset`, `MaxContentWidth = 800` (web max width).
- **Current base palette:** Primary rose `#E11D48`, background `#FFF1F2` (light) / `#121212` (dark).

> **Design rule:** new UI must consume `useTheme()` colors, `Shadows`, `Spacing`, `Fonts` — never hardcode hex values. Respect the 8 theme modes, especially `amoled` (pure black) and `glass` (translucent backgrounds where `blur`/`glass`/`glassBorder` tokens matter).

## 8. Shared components (reuse these)

- `themed-text.tsx` — 18 typography variants + any `ThemeColor`.
- `themed-view.tsx` — themed background container.
- `glass-card.tsx` — frosted-glass card (`expo-glass-effect` native, translucent web fallback).
- `icon.tsx` — central Tabler icon map + `iconForMediaType()` (14 types) + `COLLECTION_ICONS`; falls back to emoji.
- `media-card.tsx` — the universal media list/grid tile.
- `ui/`: `button`, `card`, `chip`, `input`, `modal`, `badge`, `avatar`, `progress-bar`, `bar-chart`, `empty-state`, `skeleton`, `screen-loader`, `screen`, `icon-button`, `divider`, `collapsible`, `tag-picker`, `theme-picker`.
- `animated-list.tsx` — staggered fade-in list rows.
- `error-boundary.tsx`, `app-lock-guard.tsx` + `lock-screen.tsx`, `watch-provider-links.tsx`, `external-link.tsx`, `hint-row.tsx`, `animated-icon.tsx` (splash overlay).

## 9. State & data flow

1. **Database singleton** (`src/db/index.ts`): one SQLite connection, WAL mode, migrations on open. `getActiveProfileId()` caches the active profile — **all queries/services implicitly scope to it**.
2. **Query helpers** (`src/db/queries/`): read/update helpers per domain (media, series, tags, collections, watch-history). Screens call these directly.
3. **Preference store** (`src/stores/use-preference-store.ts`): in-memory KV via `useSyncExternalStore`; Settings toggles and theme/lock/notification features read it.
4. **Theme context**: resolves preference → concrete `ThemeColors`; `useTheme()` everywhere.
5. **Services** are pure-ish modules with DB access; screens are thin: load on focus (`useFocusEffect`), render, write via services.

## 10. Design constraints & opportunities for the new UI

**Constraints (must keep):**
1. Local-first + multi-profile — profile switching UI should be easy to reach.
2. Status model (6 statuses) and media types (14) are fixed — UI chips/pickers must cover all.
3. Series/season/episode hierarchy — progress UI for episodic content is a core flow.
4. Theming is token-driven — new UI must work in all 8 themes (incl. amoled & glass).
5. Web + native: `MaxContentWidth` and safe areas; responsive at 375–1440px.
6. Achievements/stats/calendar/timeline depend on `watch_history` — logging a watch event is a first-class action.
7. App lock overlays the whole app; onboarding runs before tabs.

**Opportunities / likely UI redesign areas:**
- Home is a dense dashboard — consider a more editorial/layered layout.
- Add Media flow is a 3-step wizard — could become a single bottom sheet or half-sheet.
- Settings (785 lines) is very long — consider grouping into sub-pages or section tabs.
- Media Detail mixes poster-less hero + many cards — room for richer poster/backdrop-driven layout.
- Calendar/Timeline/Stats could share a unified "activity" visual language.
- Watch-history logging (the app's core habit loop) has no home-tab shortcut today — prime spot for a quick-action.

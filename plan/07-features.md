# Features & Modules Detail

## 1. Media Type System

### Supported Types
| Type | Key | Series Support | Notes |
|------|-----|---------------|-------|
| Movie | `movie` | No | Single entry |
| TV Show | `tv_show` | Yes | Seasons + Episodes |
| Anime | `anime` | Yes | Seasons, filler/canon tracking |
| Documentary | `documentary` | Optional | Single or series |
| Web Series | `web_series` | Yes | Like TV shows |
| Mini Series | `mini_series` | Yes | Fixed episode count |
| OVA | `ova` | Optional | Single or multi-part |
| Cartoon | `cartoon` | Yes | Like TV shows |
| Reality Show | `reality_show` | Yes | Like TV shows |
| Podcast | `podcast` | Yes | Episodes without seasons |
| Audiobook | `audiobook` | Optional | Chapters as episodes |
| Book | `book` | No | Single entry (optional) |
| Game | `game` | N/A | Future |

### Media Type Picker UI
```
┌──────────────────────────────────────┐
│         What are you adding?          │
│                                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │ 🎬 │ │ 📺 │ │ 📖 │ │ 🎥 │ │ 📹 │ │
│  │Movie│ │ TV │ │Anime│ │ Doc │ │ Web │ │
│  │     │ │Show│ │     │ │     │ │Ser. │ │
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │ 🎞 │ │ 💿 │ │ 📺 │ │ 🎧 │ │ 🎙 │ │
│  │Mini │ │ OVA│ │Cart │ │Pod  │ │Audio│ │
│  │Ser. │ │    │ │     │ │cast │ │book │ │
│  └────┘ └────┘ └────┘ └────┘ └────┘ │
│  ┌────┐ ┌────┐ ┌────┐               │
│  │ 📕 │ │ 🎮 │ │ ➕ │               │
│  │Book│ │Game│ │More│               │
│  └────┘ └────┘ └────┘               │
└──────────────────────────────────────┘
```

## 2. Watch Status System

| Status | Description | Progress State |
|--------|-------------|---------------|
| `plan_to_watch` | Not started yet | 0% |
| `watching` | Currently in progress | 1-99% |
| `completed` | Finished | 100% |
| `paused` | Stopped temporarily | Freeze progress |
| `dropped` | Gave up | Mark as dropped |
| `rewatching` | Watching again | Reset or continue |

### Status Transition Flow
```
plan_to_watch ──► watching ──► completed
                    │  │          │
                    │  ├──► paused ──► watching
                    │  │              │
                    │  └──► dropped   │
                    │                 │
                    └─────────────────┘
                          rewatching
```

## 3. Rating System

### Rating Methods
- **Star Rating**: 1-10 scale (half-stars supported)
- **Heart**: Binary (love it / don't)
- **Thumbs Up**: Binary
- **Masterpiece**: Special designation
- **Need Rewatch**: Flag for future rewatch

### Display
```
Rating: ★★★★★★★★½☆  8.5/10
❤️  Thumbs Up 👍
Masterpiece 🏆
Need Rewatch 🔄
```

## 4. Progress Engine Details

### For Movies
- Binary: watched/unwatched
- Toggle marks as completed

### For Series
```
Series: Breaking Bad
├── Season 1 (7/7) ──── 100% ──── Complete
├── Season 2 (8/13) ─── 61% ──── In Progress
├── Season 3 (0/13) ─── 0%  ──── Not Started
└── Season 4 (0/10) ─── 0%  ──── Not Started

Overall: 15/43 episodes ─── 34.8%
Current: S2 E9
Next: S2 E10
```

### Auto-Advance Logic
```
When Episode S2.E8 marked watched:
  → Current episode = 9
  → If last in season, auto-advance to S3.E1
  → If last episode overall, mark series completed
  → Recalculate percentage
  → Check achievements
  → Create watch history entry
```

### Special Episode Handling
- Filler episodes can be excluded from "required" count
- Specials tracked separately but count toward total
- Recaps can be auto-skipped in progress

## 5. Smart Recommendations

### Algorithm
```
1. Get user's top-rated media (rating >= 8)
2. Extract common genres, directors, actors, studios
3. Weight by frequency and rating
4. Find unwatched media matching profile
5. Score by match strength
6. Return top 20 sorted by score
```

### Display Cards
```
┌─────────────────────┐  ┌─────────────────────┐
│  [Poster]           │  │  [Poster]           │
│                     │  │                     │
│  Mad Max: Fury Road │  │  Blade Runner 2049  │
│  ★ 9.2 · Sci-Fi    │  │  ★ 8.9 · Sci-Fi    │
│  Recommended based  │  │  Directed by         │
│  on your love of    │  │  Denis Villeneuve   │
│  action movies      │  │  (like Arrival ★9)  │
└─────────────────────┘  └─────────────────────┘
```

## 6. Random Picker

### Filters
- Media type (movie, show, anime, etc.)
- Genre (multi-select)
- Year range (from-to)
- Runtime range (min-max)
- Status (unwatched only / any)
- Rating threshold (minimum personal rating)
- Collection (pick from a collection)
- Tags (include/exclude)

### UX
```
┌──────────────────────────────────┐
│     Can't Decide?                │
│                                  │
│  ┌──────────────────────────────┐│
│  │                              ││
│  │       [Poster]               ││
│  │                              ││
│  │    The Shawshank Redemption  ││
│  │    Movie · 1994 · 142 min   ││
│  │                              ││
│  └──────────────────────────────┘│
│                                  │
│  [🎲 Roll Again] [✅ Let's Watch]│
│                                  │
│  Filters ──── [Configure]        │
└──────────────────────────────────┘
```

## 7. Multi-Profile System

### Features
- Unlimited profiles per device
- Each profile has independent:
  - Library
  - Progress
  - Ratings
  - Stats
  - Achievements
- Profile types: Personal, Family, Kids, Guest
- Guest profile: ephemeral (not backed up)
- Quick switch from home header

### Profile Selection Screen
```
┌────────────────────────────────────┐
│     Who's watching?                │
│                                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│  │ 👤 │ │ 👤 │ │ 👤 │ │ ➕ │    │
│  │John│ │Sarah│ │ Kids│ │Add │    │
│  └────┘ └────┘ └────┘ └────┘    │
│                                    │
│  [+] Add Profile                   │
└────────────────────────────────────┘
```

## 8. Calendar Module

### Views
- **Daily**: Single day, full entries list
- **Weekly**: 7-day spread, bars per day
- **Monthly**: Traditional calendar grid, dots
- **Yearly**: 12-month overview, heatmap style

### Monthly View
```
┌────────────────────────────────────┐
│          July 2026                 │
│  Su  Mo  Tu  We  Th  Fr  Sa      │
│             1    2   3    4   5   │
│              ●   ●    ●          │
│   6   7    8    9  10  11  12    │
│  ●   ●●  ●    ●   ●    ●  ●●    │
│  13  14   15   16  17  18  19    │
│  ●                    ●          │
│  20  21←  22   23  24  25  26    │
│      ●●●  ●    ●                │
│  27  28   29   30  31            │
│                    ●             │
└────────────────────────────────────┘
Legend: Each dot = 1 watch entry
```

## 9. GitHub-Style Timeline

```
┌────────────────────────────────────┐
│  Watch Activity · 2026            │
│                                    │
│  Less ┌──┐ ┌──┐ ┌──┐ ┌──┐ More  │
│       │░░│ │▓▓│ │▒▒│ │██│        │
│       └──┘ └──┘ └──┘ └──┘        │
│                                    │
│  Jan Feb Mar Apr May Jun Jul      │
│  ░░ ░░ ▓▓ ▓▓ ▓▓ ▒▒ ██            │
│  ░░ ░░ ░░ ▓▓ ▒▒ ▒▒ ██            │
│  ░░ ░░ ░░ ░░ ▒▒ ▒▒ ██            │
│  ▒▒ ░░ ░░ ░░ ░░ ▓▓ ██            │
│  ▒▒ ▒▒ ░░ ░░ ░░ ▓▓ ██            │
│  ▓▓ ▓▓ ░░ ░░ ░░ ▓▓ ██            │
│  ▓▓ ▓▓ ▓▓ ░░ ░░ ▒▒ ██            │
│                                    │
│  Aug Sep Oct Nov Dec              │
│                                    │
└────────────────────────────────────┘
```

## 10. Achievements Catalog

| Key | Title | Criteria | Secret |
|-----|-------|----------|--------|
| `first_movie` | First Movie | Watch 1 movie | No |
| `first_episode` | First Episode | Watch 1 episode | No |
| `movie_mania` | Movie Maniac | Watch 100 movies | No |
| `cinema_master` | Cinema Master | Watch 500 movies | Yes |
| `thousand_episodes` | Thousand Episodes | Watch 1000 episodes | No |
| `weekend_warrior` | Weekend Warrior | Watch on 10 consecutive weekends | No |
| `anime_master` | Anime Master | Complete 50 anime | No |
| `binge_king` | Binge King | Watch 8+ hours in a day | No |
| `night_owl` | Night Owl | Watch after midnight 30 times | No |
| `series_addict` | Series Addict | Complete 50 TV shows | No |
| `completionist` | Completionist | Reach 100% on a series | No |
| `collector` | Collector | Create 10 collections | No |
| `organized` | Organized | Add 50 tags | No |
| `critic` | Critic | Rate 100 items | No |
| `reviewer` | Reviewer | Write 10 reviews | No |
| `diverse` | Diverse Palate | Watch 10 different genres | No |
| `librarian` | Librarian | Have 500 items in library | Yes |
| `returning` | Welcome Back | Come back after 30 days away | Yes |
| `loyalist` | Loyalist | Use the app for 1 year | Yes |
| `streak_7` | Week Streak | 7-day watch streak | No |
| `streak_30` | Month Streak | 30-day watch streak | No |
| `streak_100` | Century Streak | 100-day watch streak | Yes |
| `documentarian` | Documentarian | Watch 20 documentaries | No |
| `podcast_fan` | Podcast Fan | Listen to 100 podcast episodes | No |
| `backed_up` | Safe & Sound | First backup | No |

## 11. Theme Catalog

| Theme | Background | Text | Accent | Notes |
|-------|-----------|------|--------|-------|
| **Dark** | `#121212` | `#FFFFFF` | Blue | Standard dark mode |
| **AMOLED** | `#000000` | `#FFFFFF` | Blue | True blacks for OLED |
| **Light** | `#FFFFFF` | `#000000` | Blue | Standard light mode |
| **Glass** | Frosted | White | Tinted | Blur backgrounds |
| **Cyberpunk** | `#0a0a1a` | `#00ff88` | Pink | Neon on dark |
| **Neon** | `#1a1a2e` | `#e0e0ff` | Cyan | Vibrant bright |
| **Minimal** | `#f5f5f5` | `#333333` | None | Reduced chrome |

## 12. Export Formats

### JSON
```json
{
  "version": "1.0",
  "exported_at": "2026-07-21T10:30:00Z",
  "profile": { "name": "John", ... },
  "media": [...],
  "collections": [...],
  "tags": [...],
  "watch_history": [...],
  "achievements": [...]
}
```

### CSV
Separate files per entity type, zipped together.

### Markdown
```markdown
# The_List Export - John
## Summary
- Movies: 147
- TV Shows: 89
- Anime: 34
- Total Hours: 1,234

## Library
### Movies
1. **Inception** (2010) ★9 - Completed
2. **The Matrix** (1999) ★10 - Completed
...
```

### PDF
Formatted document with:
- Cover page with stats
- Full library listing
- Statistics charts
- Achievement showcase
- Timeline overview

## 13. Android Widget

### Continue Watching Widget
```
┌────────────────────────────────────┐
│  📺 Continue Watching              │
│                                    │
│  ┌────────────────────────────────┐│
│  │ Breaking Bad - S2.E8           ││
│  │ ████████████░░░░░░░░░ 61%     ││
│  │ [▶ Continue]                   ││
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │ Stranger Things - S4.E5       ││
│  │ ████████████████████░░ 90%   ││
│  │ [▶ Continue]                   ││
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

### Quick Actions Widget
```
┌────────────────────────────────────┐
│  📋 The_List                       │
│                                    │
│  [🎲 Random] [➕ Add] [📊 Stats] │
│                                    │
│  Today: 2 episodes                 │
│  Goal: 1 episode                   │
│  ✅ Goal met!                      │
└────────────────────────────────────┘
```

## 14. Wear OS Support

### Features
- **Now Playing**: Shows current series
- **Quick Mark**: Tap to mark episode watched
- **Quick Rating**: 1-5 stars (simplified)
- **Voice Notes**: Record quick thoughts
- **Streak Status**: Current streak at a glance

### Watch Face Complication
```
┌──────────────────┐
│  10:30           │
│  ──────────────  │
│  📺 61%         │  ← Complication
│  Breaking Bad    │     Shows current
│  S2.E8           │     progress
└──────────────────┘
```

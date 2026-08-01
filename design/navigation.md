# Navigation Structure

## Bottom Navigation (Tab Bar)

```
Home ─── Search ─── Add (center) ─── Lists ─── Profile
  │         │            │              │          │
  │         │            │              │          └── Profile screen
  │         │            │              └──────────── My Lists screen
  │         │            └─────────────────────────── Quick Add modal
  │         └──────────────────────────────────────── Global Search screen
  └────────────────────────────────────────────────── Home (Dashboard)
```

### Tab Details

| Tab | Icon (SF Symbol) | Screen | Badge |
|-----|------------------|--------|-------|
| Home | `house` | Dashboard | None |
| Search | `magnifyingglass` | Global Search | None |
| Add | `plus` (center, prominent) | Quick Add modal | None |
| Lists | `list.bullet` | My Lists | Item count |
| Profile | `person.circle` | Profile/Menu | None |

---

## Primary Navigation Flows

### Flow 1: Onboarding → Auth → Home
```
Splash → Onboarding (4 slides) → Get Started → Auth (Sign In/Sign Up) → Home
                                                    ↑
                                        Log In (from onboarding)
```

### Flow 2: Home → Item Details
```
Home → Continue Watching card → Item Details
Home → Recently Added card → Item Details
Home → Search bar → Global Search → Result → Item Details
```

### Flow 3: Add Item
```
Home → Add (tab) → Quick Add modal → [Choose type] → Add Item screen → Save → Item Details
```

### Flow 4: Lists Management
```
Home → Lists (tab) → My Lists → [Select list] → List Detail → Item Details
My Lists → + New List → Create List form
```

### Flow 5: Calendar
```
Home → Calendar (via More menu or quick link) → Select day → View entries → Item Details
```

### Flow 6: Statistics
```
Home → Statistics (via More menu) → View stats → Change period → View details
```

### Flow 7: Settings & Backup
```
Profile/More → Settings → [Setting category] → Configure
Profile/More → Backup & Restore → Back Up Now / Restore
```

---

## Secondary Navigation

### More Menu (accessed from Profile tab or header)
```
Profile
├── My Lists
├── Watch History
├── Statistics
├── Calendar
├── Reminders
├── Recommendations
├── Settings
├── Backup & Restore
├── Help & Support
├── About The_List
└── Log Out
```

### Item Details Navigation
```
Item Details
├── Watch Trailer → Video player
├── Status dropdown → Change status
├── Rating → Rate Item modal
├── Share → Share modal
├── Edit → Edit Item screen
└── Delete → Confirm Delete modal
```

---

## Modal Flows

### Quick Add (from Home tab)
```
Quick Add modal
├── Select type (Movie/Show/Anime/Others)
├── Search or paste title
├── → Add Item screen (full details)
└── Cancel → Close modal
```

### Filter & Sort (from Lists/Search)
```
Filter & Sort modal
├── Type filter (chips)
├── Status filter (chips)
├── Year filter (range)
├── Sort By (dropdown)
├── Clear all
└── Apply → Refresh list
```

### Rate Item (from Item Details)
```
Rate Item modal
├── Star rating (1-5)
├── Quick feedback text
├── Optional review text
└── Save → Update rating
```

### Share Item (from Item Details)
```
Share modal
├── Copy Link
├── WhatsApp
├── Instagram
└── More (system share sheet)
```

---

## Screen Stack Structure

```
RootStack
├── Splash
├── OnboardingStack
│   └── Onboarding slides
├── AuthStack
│   ├── Sign In
│   └── Sign Up
├── MainTabs
│   ├── HomeStack
│   │   ├── Home
│   │   └── Item Details
│   ├── SearchStack
│   │   ├── Global Search
│   │   └── Item Details
│   ├── Add (modal)
│   ├── ListsStack
│   │   ├── My Lists
│   │   ├── List Detail
│   │   └── Item Details
│   └── ProfileStack
│       ├── Profile/Menu
│       ├── Settings
│       ├── Calendar
│       ├── Statistics
│       ├── Reminders
│       └── Backup & Restore
└── Modals (overlay)
    ├── Quick Add
    ├── Filter & Sort
    ├── Rate Item
    ├── Share Item
    ├── Confirm Action
    └── Delete Item
```

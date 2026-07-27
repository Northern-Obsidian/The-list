# Navigation & Routing Plan

## Expo Router File Structure

```
src/app/
├── _layout.tsx                     # Root: providers, theme, splash
│
├── (tabs)/                         # Tab navigator
│   ├── _layout.tsx                 # Tab bar config
│   ├── index.tsx                   # Home tab (dashboard)
│   ├── search.tsx                  # Search & discover
│   ├── library.tsx                 # Library browser
│   ├── stats.tsx                   # Statistics & analytics
│   └── settings.tsx                # Settings & profile
│
├── media/
│   ├── new.tsx                     # Add media (type picker first)
│   ├── [id].tsx                    # Media detail page
│   ├── [id]/edit.tsx              # Edit media
│   └── [id]/review.tsx           # Write review
│
├── series/
│   ├── [id]/index.tsx             # Series detail (seasons overview)
│   ├── [id]/season/
│   │   └── [seasonNumber].tsx    # Season detail (episode list)
│   └── [id]/episode/
│       └── [episodeId].tsx       # Episode detail
│
├── collections/
│   ├── index.tsx                   # All collections list
│   ├── new.tsx                     # Create collection
│   └── [id].tsx                    # Collection detail
│
├── tags/
│   └── [id].tsx                    # Tag detail (all media with tag)
│
├── calendar.tsx                    # Calendar view
├── timeline.tsx                    # Watch timeline/heatmap
├── achievements.tsx                # Achievements page
├── profile/
│   └── index.tsx                   # Profile management
├── backup.tsx                      # Backup & restore
└── import.tsx                      # Import data
```

## Navigation Flow

```
                    ┌──────────────────────┐
                    │     App Launch        │
                    │  (Splash → Animated)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Profile Select     │
                    │  (if multi-profile)  │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │     Main Tabs        │
                    │  ┌───┬───┬───┬───┐  │
                    │  │ H │ S │ L │ T │  │
                    │  │ o │ e │ i │ r │  │
                    │  │ m │ a │ b │ a │  │
                    │  │ e │ r │ r │ c │  │
                    │  │   │ c │ a │ k │  │
                    │  │   │ h │ r │   │  │
                    │  │   │   │ y │ S │  │
                    │  └───┴───┴───┴───┘  │
                    └──────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
   │ Media Detail│    │Search Results│    │ Collection   │
   │             │    │              │    │   Detail     │
   └──────┬──────┘    └──────────────┘    └──────────────┘
          │                                        │
          ▼                                        ▼
   ┌──────────────┐                       ┌──────────────┐
   │Series Detail │                       │  New/Edit    │
   │ (seasons)    │                       │  Collection  │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │Season Detail │
   │ (episodes)   │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │Episode Detail│
   └──────────────┘
```

## Tab Bar Configuration

### Mobile (iOS/Android) - NativeTabs
```typescript
<Tabs
  backgroundColor={colors.background}
  indicatorColor={colors.backgroundElement}
  labelStyle={{ selected: { color: colors.text } }}
>
  <Tab name="index" title="Home" icon="house" />
  <Tab name="search" title="Search" icon="magnifyingglass" />
  <Tab name="library" title="Library" icon="books.vertical" />
  <Tab name="stats" title="Stats" icon="chart.bar" />
  <Tab name="settings" title="Settings" icon="gearshape" />
</Tabs>
```

### Web - Sidebar navigation
- Left sidebar with icons and labels
- Collapsible to icon-only mode
- Active state indicator
- Responsive: sidebar on desktop, bottom tabs on mobile web

## Deep Linking Scheme

```
thelist://
├── media/{id}
├── series/{id}
├── series/{id}/season/{number}
├── series/{id}/episode/{episodeId}
├── collections/{id}
├── tags/{id}
├── calendar?date=2026-07-21
└── profile/{id}
```

## Modal Routes

Routes that open as modals (stack on top of tabs):
- `media/new`
- `media/[id]/edit`
- `media/[id]/review`
- `collections/new`
- `profile/index`
- `import`
- `backup`

## Shared Element Transitions

- Poster image from card to detail page
- Using Reanimated 4 shared element APIs
- Configurable spring animations
- Gesture-driven dismiss on detail pages

## Route Guards

- `_layout.tsx` checks for active profile
- If no active profile, redirect to profile selection
- Backup routes require Google Sign-In check

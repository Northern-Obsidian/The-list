# The_List — Implementation Plan

> *Your entertainment universe. Tracked forever.*

## Overview

This directory contains the complete implementation plan for **The_List**, an offline-first entertainment tracker built with Expo SDK 56. Each file covers a specific aspect of the architecture.

## Plan Files

| File | Description |
|------|-------------|
| [01-architecture.md](01-architecture.md) | High-level architecture, directory structure, technology decisions |
| [02-database.md](02-database.md) | SQLite schema (Drizzle ORM), table definitions, indexes, relationships |
| [03-navigation.md](03-navigation.md) | Expo Router file structure, navigation flow, deep linking |
| [04-components.md](04-components.md) | Complete component tree, UI primitives, animation principles |
| [05-data-flow.md](05-data-flow.md) | State management, custom hooks, data flow patterns |
| [06-phases.md](06-phases.md) | 12-week implementation roadmap with phasing |
| [07-features.md](07-features.md) | Detailed feature specs (all 15+ modules) |
| [08-theme.md](08-theme.md) | Theme system, colors, typography, glassmorphism |
| [09-testing.md](09-testing.md) | Testing strategy, coverage targets, CI pipeline |
| [10-backup.md](10-backup.md) | Google Drive backup, export/import, merge strategy |

## Quick Start (Implementation Order)

### Week 1: Foundation
1. Set up Expo SDK 56 + TypeScript
2. Configure Expo Router with type-safe routes
3. Set up SQLite + Drizzle ORM
4. Run initial migration
5. Build DB connection provider
6. Create theme system (light/dark/AMOLED)
7. Build base UI components
8. Set up tab navigation (5 tabs)
9. Implement profile system
10. Set up MMKV for preferences

### Week 2: Core Library
11. Build "Add Media" flow
12. Implement media CRUD hooks
13. Build Library screen
14. Build MediaCard component
15. Build MediaDetail screen
16. Implement search with debounce
17. Build Search screen with filters

### Week 3-12
See [06-phases.md](06-phases.md) for the complete 12-week breakdown.

## Key Technical Decisions

- **No state management library** — React Context + custom hooks + sync DB
- **No NativeWind/Tailwind** — StyleSheet.create for full control
- **Drizzle ORM** for type-safe SQLite queries
- **MMKV** for fast key-value preferences
- **Reanimated 4** for 60fps UI thread animations
- **No TMDB/API dependency** — user-entered metadata only
- **7 themes** with Material You dynamic colors

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│              UI Layer (Expo Router)          │
│  Screens → Components → Hooks → Navigation │
├─────────────────────────────────────────────┤
│          State Layer (Context + Hooks)       │
├─────────────────────────────────────────────┤
│          Storage Layer (SQLite + MMKV)       │
├─────────────────────────────────────────────┤
│       Backup Layer (Google Drive - Optional) │
└─────────────────────────────────────────────┘
```

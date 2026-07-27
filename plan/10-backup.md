# Backup & Export Architecture

## Google Drive Backup

### Flow
```
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
│  User taps   │    │  Google Sign-  │    │  Database       │
│  "Backup"    │───►│  In (optional) │───►│  Export to JSON │
└──────────────┘    └────────────────┘    └────────┬────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Compress +      │
                                        │  Encrypt (AES)   │
                                        └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Upload to Drive │
                                        │  App Folder      │
                                        └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Store file ID   │
                                        │  locally + DB    │
                                        └─────────────────┘
```

### Backup Format
```
backup_2026-07-21_103000.json
├── version: "1.0"
├── app_version: "1.0.0"
├── created_at: "2026-07-21T10:30:00Z"
├── profile_id: "uuid"
├── checksum: "sha256"
├── data:
│   ├── media: [...]           # Full media table
│   ├── series: [...]          # Full series table
│   ├── seasons: [...]         # Full seasons table
│   ├── episodes: [...]        # Full episodes table
│   ├── collections: [...]     # Full collections
│   ├── media_collections: [...]
│   ├── tags: [...]            # Full tags
│   ├── media_tags: [...]
│   ├── watch_history: [...]   # Full history
│   ├── reviews: [...]         # Full reviews
│   ├── ratings: [...]         # Full ratings
│   ├── achievements: [...]    # Achievement progress
│   ├── preferences: [...]     # User preferences
│   └── profiles: [...]        # Profile data
```

### Restore Flow
```
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
│  User taps   │    │  List backups  │    │  Download +      │
│  "Restore"   │───►│  from Drive    │───►│  Decrypt         │
└──────────────┘    └────────────────┘    └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Validate JSON   │
                                        │  Schema (Zod)    │
                                        └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Preview changes │
                                        │  (dry run)       │
                                        └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Execute in      │
                                        │  transaction     │
                                        └────────┬─────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  Recalculate     │
                                        │  stats/achievements │
                                        └─────────────────┘
```

### Merge Strategy
When restoring into an existing database:
```
For each item in backup:
  - Find match by title + year + type
  - If no match: INSERT
  - If match found:
    - Skip (keep existing)
    - Overwrite (use backup version)
    - Merge (combine fields)
  - Resolve conflicts via user choice
```

## Export Formats

### JSON Export
Full structured export of all profile data.
Used primarily for backup and re-import.

### CSV Export
Separate CSVs per entity type, zipped.
```
export_2026-07-21/
├── media.csv
├── series.csv
├── seasons.csv
├── episodes.csv
├── collections.csv
├── tags.csv
├── watch_history.csv
├── ratings.csv
└── reviews.csv
```

### Markdown Export
Human-readable formatted report.
```markdown
# The_List Export
**Profile**: John
**Date**: 2026-07-21

## Summary
- Movies: 147
- TV Shows: 89
- Total Hours: 1,234

## Recently Watched
| Date | Title | Type | Rating |
|------|-------|------|--------|
| 2026-07-21 | Breaking Bad S2.E8 | TV | ★9 |
| 2026-07-20 | Inception | Movie | ★10 |
...
```

### PDF Export
Using `expo-print` to generate a PDF from HTML template.
- Cover page with stats
- Full library listing
- Statistics charts
- Achievements showcase
- Timeline overview

## Local Backup

Automatic local backup before destructive operations:
```typescript
function autoBackup() {
  // Before migration
  // Before import
  // Before restore
  // Before bulk delete
  // Save to app documents/backups/
  // Keep last 5 local backups
  // Max 3 Drive backups
}
```

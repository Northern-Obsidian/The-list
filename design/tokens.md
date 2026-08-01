# Design Tokens

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `half` | 2px | Tight spacing (icon to text) |
| `one` | 4px | Minimal spacing |
| `two` | 8px | Small spacing (chip padding, list gaps) |
| `three` | 16px | Medium spacing (card padding, section gaps) |
| `four` | 24px | Large spacing (screen padding, section margins) |
| `five` | 32px | XL spacing (modal padding) |
| `six` | 48px | XXL spacing (bottom safe area) |
| `seven` | 64px | XXXL spacing |
| `eight` | 96px | Maximum spacing |

---

## Border Radius

| Element | Radius | Notes |
|---------|--------|-------|
| Buttons | 12-16px | Pill shape for primary |
| Cards | 12-16px | `borderCurve: 'continuous'` |
| Input fields | 12px | `borderCurve: 'continuous'` |
| Chips/Tags | 20px (pill) | Fully rounded |
| Modals (bottom sheet) | 16-20px top | Only top corners |
| Avatar | 50% | Circular |

---

## Typography

### Screen Titles
- Size: 28-32px
- Weight: 700 (Bold)
- Used in: List header, Settings, Statistics

### Section Headers
- Size: 18-20px
- Weight: 600 (SemiBold)
- Used in: "Continue Watching", "Your Lists", "Your Statistics"

### Card Titles
- Size: 16px
- Weight: 600 (SemiBold)
- Used in: Media card titles, list item names

### Body Text
- Size: 16px
- Weight: 400 (Regular)
- Used in: Descriptions, subtitles

### Secondary Text
- Size: 14px
- Weight: 400 (Regular)
- Color: Gray/secondary
- Used in: Subtitles, timestamps, counts

### Small Text / Captions
- Size: 12px
- Weight: 400 (Regular)
- Used in: Labels, metadata, progress text

### Tab Labels
- Size: 12px
- Weight: 500 (Medium)
- Used in: Bottom tab bar labels

---

## Colors (Light Mode)

### Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| Primary BG | `#FFFFFF` | Screen background |
| Secondary BG | `#F8F9FA` | Card backgrounds, sections |
| Tertiary BG | `#F0F1F3` | Input backgrounds, chips |
| Selected BG | `#E0E1E6` | Selected states |

### Text
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#000000` | Headings, titles |
| Secondary | `#60646C` | Subtitles, descriptions |
| Tertiary | `#9CA3AF` | Captions, metadata |

### Accent
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#3C9FFE` | Links, active states, progress |
| Success | `#10B981` | Completed, positive trends |
| Warning | `#F59E0B` | Alerts, warnings |
| Error | `#EF4444` | Destructive actions, errors |
| Info | `#3B82F6` | Informational |

### Borders
| Name | Hex | Usage |
|------|-----|-------|
| Default | `#E5E7EB` | Card borders, dividers |
| Light | `#F3F4F6` | Subtle borders |

---

## Colors (Dark Mode)

### Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| Primary BG | `#121212` | Screen background |
| Secondary BG | `#1E1E1E` | Card backgrounds |
| Tertiary BG | `#2A2A2A` | Input backgrounds |
| Selected BG | `#2E3135` | Selected states |

### Text
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#FFFFFF` | Headings, titles |
| Secondary | `#B0B4BA` | Subtitles, descriptions |
| Tertiary | `#6B7280` | Captions, metadata |

### Accent
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#3C9FFE` | Same as light |
| Success | `#34D399` | Adjusted for dark bg |
| Warning | `#FBBF24` | Adjusted for dark bg |
| Error | `#F87171` | Adjusted for dark bg |
| Info | `#60A5FA` | Adjusted for dark bg |

---

## Shadows

| Elevation | Shadow | Usage |
|-----------|--------|-------|
| Low | `0 1px 2px rgba(0,0,0,0.05)` | Subtle cards, chips |
| Medium | `0 1px 3px rgba(0,0,0,0.12)` | Buttons, raised cards |
| High | `0 4px 12px rgba(0,0,0,0.1)` | Elevated cards, modals |

---

## Bottom Tab Bar

- Height: ~80px (including safe area)
- Background: Matches screen background
- Active icon: Filled, primary color
- Inactive icon: Gray
- Center "Add" button: Larger (56px), primary color background, white icon
- Active indicator: Blue dot or underline below active tab

---

## Top Bar / Navigation Header

- Height: ~44px (content) + status bar
- Back arrow: 24px, left side
- Title: Centered, 17px, semi-bold
- Action icons: Right side, 24px
- Background: Transparent or solid (matches screen)

---

## Card Dimensions

| Card Type | Width | Height | Padding |
|-----------|-------|--------|---------|
| Media (horizontal) | Full width | 80-100px | 12px |
| Media (vertical/poster) | 120-140px | 180-200px | 8px |
| Stat card | 50% (2 col) | 80-100px | 16px |
| List item | Full width | 56-64px | 16px |
| Reminder card | Full width | 72-80px | 16px |

---

## Icon Sizes

| Context | Size |
|---------|------|
| Tab bar icon | 24px |
| Screen header icon | 24px |
| Card icon | 20-24px |
| Chip/tag icon | 16px |
| Inline icon | 14-16px |
| Large feature icon | 32-48px |

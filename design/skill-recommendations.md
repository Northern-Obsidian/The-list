# UI/UX Pro Max — Skill Recommendations for The List

Generated from `.agents/ui-ux-pro-max-skill` reasoning engine.

---

## Product Classification

**Category:** Social Media App (entertainment/tracking focus)

**Matching Product Types:**
1. **Social Media App** — Primary match
   - Keywords: app, community, content, entertainment, media, network, sharing, social, streaming, users, video
   - Primary Styles: Vibrant & Block-based + Motion-Driven
   - Secondary Styles: Aurora UI, Micro-interactions
   - Dashboard Style: User Behavior Analytics

2. **News/Media Platform** — Secondary match
   - Keywords: content, entertainment, media, news, platform, streaming, video
   - Primary Styles: Minimalism + Flat Design
   - Secondary Styles: Dark Mode (OLED), Accessible & Ethical

---

## Recommended Design System

### Pattern: App Store Style Landing
- Show real screenshots
- Include ratings (4.5+ stars)
- Platform-specific CTAs
- Section order: Hero → Screenshots → Features → Reviews → Download

### Style: Vibrant & Block-based
- **Mode Support:** Light ✓ Full | Dark ✓ Full
- **Performance:** Good
- **Accessibility:** Ensure WCAG compliance
- **Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern

### Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#E11D48` | Brand color, active states |
| On Primary | `#FFFFFF` | Text on primary |
| Secondary | `#FB7185` | Secondary actions, accents |
| Accent/CTA | `#2563EB` | Call-to-action buttons, links |
| Background | `#FFF1F2` | Screen background (light) |
| Foreground | `#881337` | Headings, titles |
| Muted | `#F0ECF2` | Disabled states, subtle bg |
| Border | `#FECDD3` | Card borders, dividers |
| Destructive | `#DC2626` | Delete, remove actions |
| Ring | `#E11D48` | Focus rings |

### Typography

- **Heading:** Righteous (bold, playful, entertainment feel)
- **Body:** Poppins (clean, readable, modern)
- **Mood:** Music, entertainment, fun, energetic, bold, performance
- **Google Fonts:** [Righteous + Poppins](https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Righteous&display=swap)

### Key Effects
- Large sections (48px+ gaps)
- Animated patterns
- Bold hover (color shift)
- Scroll-snap
- Large type (32px+)
- 200-300ms transitions

---

## Anti-Patterns to Avoid

- Heavy skeuomorphism
- Accessibility ignored
- Emojis as icons (use SF Symbols/expo-image)
- Missing cursor:pointer on web
- Layout-shifting hovers (no scale transforms)
- Low contrast text (maintain 4.5:1)
- Instant state changes (always use transitions)
- Invisible focus states

---

## React Native Stack Guidelines

### Performance
- Use `React.memo` for pure components
- Use `useCallback` for event handlers
- Use `useMemo` for expensive computations
- Enable Hermes engine
- Use `react-native-reanimated` for complex animations

### Navigation
- Type navigation params for type safety
- Use React Navigation (Expo Router wraps this)
- Support deep linking
- Preserve navigation history (back button)

### Forms
- Use proper `keyboardType` for input types
- Use controlled inputs (`value` + `onChangeText`)
- Show appropriate keyboard for input type

### UX Guidelines
- Preserve back button behavior
- Add padding for sticky navbars
- Mobile-first design approach
- Show user location in hierarchy (breadcrumbs for deep navigation)

---

## Pre-Delivery Checklist

Before delivering any UI code:

- [ ] No emojis used as icons (use SF Symbols)
- [ ] All icons from consistent icon set
- [ ] Hover states with smooth transitions (150-300ms) — web only
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation — web
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px — web
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile (except intentional carousels)

# Component Patterns

## Buttons

### Primary Button
- Filled background (black on light, white on dark)
- White/black text, bold, centered
- Rounded corners (12-16px radius)
- Full width or auto width
- Example: "Sign In", "Save", "Get Started", "Back Up Now"

### Secondary Button
- Outlined (1px border, transparent fill)
- Text color matches border
- Same border radius as primary
- Example: "Continue with Google", "Continue with Apple", "Watch Trailer", "Restore from Backup"

### Ghost Button
- No border, no fill
- Text only, colored
- Example: "Log In", "Forgot password?"

### Icon Button
- Circular or rounded square
- Icon centered
- Example: profile avatar, share icon, close X

---

## Cards

### Media Card (Horizontal)
- Poster thumbnail (left)
- Title, year, duration, rating
- Progress bar (if watching)
- Time remaining text
- Used in: Continue Watching, Search Results

### Media Card (Vertical/Poster)
- Poster image (full)
- Title below (1-2 lines, truncated)
- Used in: Recently Added, horizontal scrolls

### List Card
- Icon (left), name, item count (right)
- Chevron right indicator
- Used in: My Lists screen

### Stat Card
- Large number (bold)
- Label below (small, secondary color)
- Trend indicator (+/- vs last month)
- Used in: Statistics screen

### Reminder Card
- Icon (left, colored by type)
- Title, subtitle (date/time)
- Toggle switch (right)
- Used in: Reminders screen

### Setting Card
- Icon (left)
- Label text
- Chevron right
- Used in: Settings screen

---

## Form Elements

### Text Input
- Label above (optional)
- Rounded border, light background
- Placeholder text (gray)
- Clear button (X) when filled
- Error state: red border, error text below

### Search Input
- Magnifying glass icon (left)
- Rounded, full width
- Placeholder text
- Auto-focus on dedicated search screens

### Dropdown/Select
- Current value displayed
- Chevron down indicator
- Taps to open picker
- Example: Status dropdown in Item Details

### Chip/Tag
- Rounded pill shape
- Filled (selected) or outlined (unselected)
- Text label
- Used in: Type selector, Add to List options, Genre tags

### Radio Chip
- Similar to chip but single-select
- Filled when selected
- Used in: Add to List (Watchlist/Watching/Plan to Watch)

---

## Navigation

### Bottom Tab Bar
- 5 tabs: Home, Search, Add (center), Lists, Profile
- Center "Add" button is larger/prominent (circular, primary color)
- Active tab: filled icon + bold label
- Active indicator: blue dot or underline

### Top Bar
- Back arrow (left)
- Title (center)
- Action icons (right): share, close, add
- Transparent or solid background

---

## Data Display

### Progress Bar
- Rounded, thin bar
- Filled portion shows progress %
- Used in: Continue Watching cards, Item Details

### Star Rating
- 5 stars (outlined or filled)
- Tap to rate
- Used in: Item Details, Rate Item modal

### Genre Tags
- Small rounded chips
- Light background, dark text
- Horizontal wrap layout
- Used in: Item Details

### Calendar Day
- Number centered
- Dot indicator below (if entry exists)
- Blue circle (selected day)
- Gray text for days outside current month

### Bar Chart
- Horizontal bars
- Label (left), bar (center), percentage (right)
- Used in: Statistics — Top Genres

### Empty State
- Centered icon/illustration
- Title text
- Subtitle/description
- Action button (optional)
- Used when: no results, no items, no connection

---

## Modals

### Bottom Sheet Modal
- Drag handle at top
- Title centered
- "Done" button (top right)
- Content below
- Rounded top corners
- Dark overlay backdrop

### Quick Add Modal
- Type picker (icons: Movie, Show, Anime, Others)
- Search bar
- Cancel button (bottom)

### Filter & Sort Modal
- Filter options (Type, Status, Year, Sort By)
- Each with dropdown/chips
- Clear button (top right)
- Apply button (bottom)

### Rate Item Modal
- Title: "Rate [Item Name]"
- 5 star rating
- "Great!" text feedback
- Optional review text input
- Save button

### Share Item Modal
- Title: "Share [Item Name]"
- Share options: Copy Link, WhatsApp, Instagram, More
- Cancel button

### Confirm Action Modal
- Title: "Remove from List?"
- Description: "[Item] will be removed from your list."
- Destructive button (red): "Remove"
- Cancel button

### Delete Item Modal
- Title: "Delete Item?"
- Description: "This action cannot be undone. Item will be permanently deleted."
- Destructive button (red): "Delete"
- Cancel button

---

## Empty States

### No Results Found
- Search icon (gray)
- "No Results Found"
- "Try adjusting your search or filters."
- "Clear Filters" button

### No Internet Connection
- WiFi-off icon (gray)
- "No Internet Connection"
- "Please check your connection and try again."
- "Retry" button

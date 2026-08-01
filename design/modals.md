# Modals & Supporting Flows

## Quick Add (from Home)

**Trigger:** Center "Add" tab button

**Layout:**
- Header: "Quick Add" title, "X" close button (top right)
- Type selector (horizontal row of icon chips):
  - Movie (film icon)
  - Show (tv icon)
  - Anime (sparkles icon)
  - Others (grid icon)
- Search bar: "Search title..."
- **CANCEL** button (full width, bottom)

**Behavior:**
- Selecting a type highlights the chip
- Typing in search shows results
- Tapping a result navigates to Add Item screen with pre-filled title
- Cancel dismisses the modal

---

## Filter & Sort

**Trigger:** Filter icon on Lists or Search screens

**Layout:**
- Header: "Filters" title, "Clear" button (top right)
- Filter sections (vertical stack):
  - **Type**: Movie, Show, Anime, Others (multi-select chips)
  - **Status**: Watchlist, Watching, Completed, Plan to Watch, Dropped (multi-select chips)
  - **Year**: Range selector or dropdown
  - **Sort By**: Recently Added, Rating A-Z, Year, Date Added (dropdown)
- **Apply** button (full width, bottom)

**Behavior:**
- Multiple selections allowed for Type and Status
- Clear resets all filters to default
- Apply closes modal and refreshes list with filtered results

---

## Rate Item

**Trigger:** Star rating area on Item Details

**Layout:**
- Header: "Rate [Item Name]" title, "X" close button (top right)
- 5 stars (large, tappable)
- Quick feedback text below stars (changes based on rating):
  - 1 star: "Poor"
  - 2 stars: "Okay"
  - 3 stars: "Good"
  - 4 stars: "Great!"
  - 5 stars: "Excellent!"
- Optional text input: "Add a review (optional)"
- **Save** button (full width, bottom)

**Behavior:**
- Tapping a star fills all stars up to that point
- Feedback text updates in real-time
- Save stores rating and optional review, closes modal

---

## Share Item

**Trigger:** Share icon on Item Details

**Layout:**
- Header: "Share [Item Name]" title, "X" close button (top right)
- Share options (horizontal row of icons with labels):
  - Copy Link (link icon)
  - WhatsApp (WhatsApp icon)
  - Instagram (Instagram icon)
  - More (ellipsis icon → system share sheet)
- **Cancel** button (full width, bottom)

**Behavior:**
- Copy Link copies item URL to clipboard with toast confirmation
- WhatsApp/Instagram opens respective app with pre-filled content
- More opens system share sheet

---

## Confirm Action (Remove from List)

**Trigger:** Remove action on Item Details or List

**Layout:**
- Title: "Remove from List?"
- Description: "[Item Name] will be removed from your list."
- **Remove** button (red, destructive)
- **Cancel** button (outlined, below)

**Behavior:**
- Remove executes the action and closes modal
- Cancel closes modal without action

---

## Delete Item

**Trigger:** Delete action on Item Details or Edit

**Layout:**
- Title: "Delete Item?"
- Description: "This action cannot be undone. Item will be permanently deleted."
- **Delete** button (red, destructive)
- **Cancel** button (outlined, below)

**Behavior:**
- Delete permanently removes item and all associated data (ratings, reviews, progress)
- Cancel closes modal without action

---

## Empty States

### No Results Found
- **Trigger:** Search returns no results, or filter yields no items
- **Layout:**
  - Search/magnifying glass icon (large, gray)
  - "No Results Found" (bold)
  - "Try adjusting your search or filters." (secondary text)
  - **Clear Filters** button (if filters are active)

### No Internet Connection
- **Trigger:** Network request fails
- **Layout:**
  - WiFi-off icon (large, gray)
  - "No Internet Connection" (bold)
  - "Please check your connection and try again." (secondary text)
  - **Retry** button

### Empty List
- **Trigger:** List has no items
- **Layout:**
  - List icon (large, gray)
  - "No Items Yet" (bold)
  - "Add some items to this list." (secondary text)
  - **Add Item** button

---

## Confirm Actions Summary

| Action | Title | Description | Button |
|--------|-------|-------------|--------|
| Remove from list | "Remove from List?" | "[Item] will be removed from your list." | Remove (red) |
| Delete item | "Delete Item?" | "This action cannot be undone. Item will be permanently deleted." | Delete (red) |
| Log out | "Log Out?" | "Are you sure you want to log out?" | Log Out (red) |
| Discard changes | "Discard Changes?" | "You have unsaved changes. Are you sure?" | Discard (red) |

# School Autocomplete Feature

## Overview

The school autocomplete feature allows users to search and select schools from the database during registration. It provides a smooth, accessible, and user-friendly experience with real-time search results.

## Implementation

### Components

#### 1. **Autocomplete Component** (`src/components/ui/Autocomplete.tsx`)

A reusable, fully-featured autocomplete component with the following best practices:

**Features:**
- **Debouncing**: Delays search requests by 300ms (configurable) to reduce API calls
- **Minimum Characters**: Requires 2+ characters before triggering search (configurable)
- **Keyboard Navigation**: 
  - `Arrow Down/Up`: Navigate through results
  - `Enter`: Select highlighted option
  - `Escape`: Close dropdown
  - `Tab`: Close dropdown and move to next field
- **Loading States**: Shows "Hledám školy..." while searching
- **Empty States**: Shows "Žádné školy nenalezeny" when no results
- **Click Outside**: Closes dropdown when clicking outside
- **Accessibility**: Full ARIA support for screen readers
- **Visual Feedback**: Highlights hovered/selected items
- **Auto-scroll**: Scrolls highlighted item into view

**Props:**
```typescript
interface AutocompleteProps {
  id?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => Promise<AutocompleteOption[]>
  disabled?: boolean
  required?: boolean
  minChars?: number          // Default: 2
  debounceMs?: number        // Default: 300
  emptyMessage?: string      // Default: "Žádné výsledky"
  loadingMessage?: string    // Default: "Vyhledávání..."
  rightIcon?: React.ReactNode
  className?: string
}

interface AutocompleteOption {
  value: string      // Unique identifier (e.g., schoolId)
  label: string      // Main display text (e.g., school name)
  subtitle?: string  // Optional secondary text (e.g., city, region)
}
```

#### 2. **School Search Helper** (`src/lib/supabase/schools.ts`)

Database helper functions for school search operations:

**Functions:**

```typescript
// Search schools by name
searchSchools(query: string, limit?: number): Promise<AutocompleteOption[]>

// Get school by ID
getSchoolById(schoolId: number): Promise<School | null>
```

**Search Logic:**
- Searches in the `Plný název` (Full name) column using case-insensitive ILIKE
- Returns up to 10 results by default
- Orders results alphabetically
- Includes location information (Místo, Kraj) as subtitle

### Database

#### Schools Table Structure

```sql
schools (
  schoolId BIGINT PRIMARY KEY,
  "Plný název" TEXT,           -- Full school name (searchable)
  "Zkrácený název" TEXT,       -- Short name
  Místo TEXT,                  -- City/Town
  Kraj TEXT,                   -- Region
  RED_IZO BIGINT,
  IČO BIGINT,
  -- ... other fields
)
```

### Usage Example

```tsx
import { Autocomplete } from "@/components/ui/Autocomplete"
import { searchSchools } from "@/lib/supabase/schools"

function MyComponent() {
  const [schoolName, setSchoolName] = React.useState("")

  return (
    <Autocomplete
      id="school-name"
      placeholder="Začněte psát název školy..."
      value={schoolName}
      onChange={setSchoolName}
      onSearch={searchSchools}
      required
      minChars={2}
      debounceMs={300}
      emptyMessage="Žádné školy nenalezeny"
      loadingMessage="Hledám školy..."
      rightIcon={<SearchIcon />}
    />
  )
}
```

## Integration in CompleteRegistrationModal

The autocomplete has been integrated into the registration flow:

1. **Teacher Selection**: When user selects "Jsem učitel" (I am a teacher)
2. **School Search**: The autocomplete field appears with search icon
3. **Real-time Search**: As user types (2+ characters), schools are searched
4. **Selection**: User can click or use keyboard to select a school
5. **Validation**: School name is required for teachers before completing registration

## User Experience

### Visual States

1. **Initial**: Shows placeholder "Začněte psát název školy..."
2. **Typing (< 2 chars)**: No dropdown
3. **Typing (2+ chars)**: Shows "Hledám školy..." loading state
4. **Results Found**: Displays up to 10 schools with location info
5. **No Results**: Shows "Žádné školy nenalezeny"
6. **Selected**: Input shows selected school name

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Type (2+ chars) | Triggers search |
| ↓ | Move to next result |
| ↑ | Move to previous result |
| Enter | Select highlighted result |
| Escape | Close dropdown |
| Tab | Close dropdown, move to next field |

## Performance Considerations

1. **Debouncing**: Prevents excessive API calls while typing
2. **Limit Results**: Returns max 10 results to keep UI fast
3. **Indexed Search**: Uses database index on `Plný název` for fast queries
4. **Client-side Caching**: Supabase client caches recent queries

## Accessibility (WCAG 2.1 AA)

- ✅ Full keyboard navigation
- ✅ ARIA roles and attributes (combobox, listbox, option)
- ✅ Screen reader support
- ✅ Focus management
- ✅ High contrast compatible
- ✅ Clear error and loading states

## Future Enhancements

Potential improvements:
- Cache search results on client
- Fuzzy matching for typos
- Search by city/region
- Show school type/level indicators
- Recent searches history
- Favorite/saved schools

## Troubleshooting

### Common Issues

**Issue**: Autocomplete doesn't show results
- Check that schools table has data
- Verify RLS policies allow public read access
- Check browser console for errors

**Issue**: Search is too slow
- Ensure database has index on `Plný název` column
- Consider reducing result limit
- Check network connection

**Issue**: Can't select with keyboard
- Ensure JavaScript is enabled
- Check for conflicting keyboard event handlers
- Verify browser compatibility (Chrome, Firefox, Safari, Edge)

## Technical Details

### Dependencies
- React 18+
- Supabase JS Client
- Tailwind CSS

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### TypeScript
Fully typed with TypeScript interfaces and type safety.


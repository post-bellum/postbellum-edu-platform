# Complete Registration Modal - User Flow

## Overview

After Google OAuth login, new users must complete their registration by providing additional information. The form adapts based on whether the user is a teacher or not.

## User Type Selection

### 1. Teacher ("Jsem učitel")

**Field shown:** Text input with search icon

- **Label:** "Název školy *"
- **Placeholder:** "Hledat školu"
- **Type:** Free text input
- **Purpose:** Teachers enter the actual name of their school
- **Example values:** 
  - "Základní škola Masarykova"
  - "Gymnázium Jana Nerudy"
  - "Střední průmyslová škola Ostrava"

### 2. Non-Teacher ("Nejsem učitel")

**Field shown:** Select dropdown

- **Label:** "Kategorie *"
- **Placeholder:** "Vyberte kategorii"
- **Type:** Dropdown select
- **Options:**
  1. **Zřizovatel a další organizace zaměřující se na vzdělávání**
     - School founders, educational organizations, NGOs focused on education
  2. **Partner nebo projekty Post Bellum**
     - Partners or people working on Post Bellum projects
  3. **Rodič**
     - Parents interested in educational materials
  4. **Ostatní**
     - Other categories not covered above

## Form Layout

```
┌────────────────────────────────────────────┐
│   Dokončení registrace                     │
│                                            │
│   User Type Selection:                     │
│   ○ Jsem učitel                           │
│   ● Nejsem učitel                         │
│                                            │
│   Kategorie *                              │
│   ┌──────────────────────────────────┐    │
│   │ Vyberte kategorii          ▼     │    │
│   └──────────────────────────────────┘    │
│                                            │
│   ☐ Souhlasím se zasíláním...             │
│                                            │
│   ┌──────────────────────────────────┐    │
│   │         Dokončit                  │    │
│   └──────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

When user switches to "Jsem učitel":

```
┌────────────────────────────────────────────┐
│   Dokončení registrace                     │
│                                            │
│   User Type Selection:                     │
│   ● Jsem učitel                           │
│   ○ Nejsem učitel                         │
│                                            │
│   Název školy *                            │
│   ┌──────────────────────────────────┐    │
│   │ Hledat školu              🔍      │    │
│   └──────────────────────────────────┘    │
│                                            │
│   ☐ Souhlasím se zasíláním...             │
│                                            │
│   ┌──────────────────────────────────┐    │
│   │         Dokončit                  │    │
│   └──────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

## Behavior

### Field Switching
- When user clicks on a different radio button, the field below **switches instantly**
- Previous input is **cleared** when switching between types
- This prevents confusion (e.g., having a category value when user is now a teacher)

### Validation
- Required field indicator (*) shown in red
- Submit button is **disabled** until:
  - ✅ User type is selected
  - ✅ School name/category is filled
  - ✅ Not currently submitting

### Modal Constraints
- Cannot be closed by clicking outside
- Cannot be closed by pressing ESC key  
- No X button in corner
- User **must** complete the form to proceed

## Data Storage

### For Teachers
```typescript
{
  user_type: "teacher",
  school_name: "Základní škola Masarykova", // Actual school name
  email_consent: true,
  registration_completed: true
}
```

### For Non-Teachers
```typescript
{
  user_type: "not-teacher",
  school_name: "parent", // Category value: "founder", "partner", "parent", or "other"
  email_consent: false,
  registration_completed: true
}
```

## Implementation Details

### Select Component Options

```typescript
const NON_TEACHER_OPTIONS = [
  { 
    value: "founder", 
    label: "Zřizovatel a další organizace zaměřující se na vzdělávání" 
  },
  { 
    value: "partner", 
    label: "Partner nebo projekty Post Bellum" 
  },
  { 
    value: "parent", 
    label: "Rodič" 
  },
  { 
    value: "other", 
    label: "Ostatní" 
  },
]
```

### State Management

```typescript
const [userType, setUserType] = useState<"teacher" | "not-teacher">("not-teacher")
const [schoolName, setSchoolName] = useState("")

const handleUserTypeChange = (value: string) => {
  setUserType(value as "teacher" | "not-teacher")
  setSchoolName("") // Clear previous input
}
```

## Accessibility

- ✅ All form fields have proper labels
- ✅ Required fields marked with asterisk and aria-required
- ✅ Select dropdown keyboard navigable
- ✅ Focus states clearly visible
- ✅ Error messages announced to screen readers

## Future Enhancements

1. **School Search/Autocomplete** (for teachers)
   - Could integrate with a database of Czech schools
   - Auto-complete as user types
   - Suggest schools based on partial match

2. **Analytics**
   - Track which categories are most common
   - Understand user distribution (teachers vs non-teachers)

3. **Additional Fields**
   - Subject taught (for teachers)
   - Grade levels (for teachers)
   - Specific partner name (for partners)

4. **Validation**
   - Email format validation for email consent opt-in
   - School name minimum length (prevent single character submissions)


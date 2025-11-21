# User Profile Display on Home Page

## Overview

After completing Google OAuth registration, users see their profile information displayed on the home page below the logout button.

## Visual Examples

### 1. Teacher Profile

```
┌─────────────────────────────────────┐
│         Odhlásit se (...)           │  ← Button
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Přihlášen jako               │
│                                     │
│    teacher@school.cz               │ ← Email (bold)
│  ─────────────────────────────      │ ← Divider
│         Učitel                      │ ← Role (primary color)
│    Základní škola Masarykova       │ ← School name
└─────────────────────────────────────┘
```

### 2. Non-Teacher Profile - Parent

```
┌─────────────────────────────────────┐
│         Odhlásit se (...)           │  ← Button
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Přihlášen jako               │
│                                     │
│      parent@email.cz               │ ← Email (bold)
│  ─────────────────────────────      │ ← Divider
│            Rodič                    │ ← Category
└─────────────────────────────────────┘
```

### 3. Non-Teacher Profile - Partner

```
┌─────────────────────────────────────┐
│         Odhlásit se (...)           │  ← Button
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Přihlášen jako               │
│                                     │
│    partner@postbellum.cz           │ ← Email (bold)
│  ─────────────────────────────      │ ← Divider
│ Partner nebo projekty Post Bellum  │ ← Category
└─────────────────────────────────────┘
```

### 4. Non-Teacher Profile - Founder

```
┌─────────────────────────────────────┐
│         Odhlásit se (...)           │  ← Button
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Přihlášen jako               │
│                                     │
│     founder@org.cz                 │ ← Email (bold)
│  ─────────────────────────────      │ ← Divider
│ Zřizovatel a další organizace      │ ← Category
│   zaměřující se na vzdělávání      │
└─────────────────────────────────────┘
```

### 5. Non-Teacher Profile - Other

```
┌─────────────────────────────────────┐
│         Odhlásit se (...)           │  ← Button
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Přihlášen jako               │
│                                     │
│      other@email.cz                │ ← Email (bold)
│  ─────────────────────────────      │ ← Divider
│           Ostatní                   │ ← Category
└─────────────────────────────────────┘
```

## Styling Details

### Container
- Background: Gray-50 (`bg-gray-50`)
- Rounded corners (`rounded-lg`)
- Padding: 1rem (`p-4`)
- Max width: Medium (`max-w-md`)
- Centered

### Text Hierarchy
1. **"Přihlášen jako"**
   - Size: Small (`text-sm`)
   - Color: Gray-600 (`text-gray-600`)
   - Centered

2. **Email**
   - Size: Base (`text-base`)
   - Weight: Medium (`font-medium`)
   - Color: Gray-900 (`text-gray-900`)
   - Centered

3. **Divider**
   - Border top
   - Color: Gray-200 (`border-gray-200`)

4. **Role/Category**
   - For Teachers:
     - "Učitel" label: Small, medium weight, primary color
     - School name: Small, gray-600
   - For Non-Teachers:
     - Category: Small, gray-600

## Data Flow

```typescript
// On page load (if logged in)
const profile = await getUserProfile()
// Returns:
{
  email: "user@email.cz",
  userType: "teacher" | "not-teacher",
  schoolName: "School Name" | "founder" | "partner" | "parent" | "other",
  emailConsent: boolean,
  registrationCompleted: boolean
}

// Display logic
if (userType === "teacher") {
  show: "Učitel" + schoolName
} else {
  show: CATEGORY_LABELS[schoolName]
}
```

## Category Label Mapping

```typescript
const CATEGORY_LABELS = {
  founder: "Zřizovatel a další organizace zaměřující se na vzdělávání",
  partner: "Partner nebo projekty Post Bellum",
  parent: "Rodič",
  other: "Ostatní",
}
```

## Behavior

### On Login
1. User logs in via Google OAuth
2. If registration incomplete → Show CompleteRegistrationModal
3. If registration complete → Fetch and display profile

### On Registration Complete
1. Modal closes
2. Profile is fetched from user metadata
3. Profile card appears immediately (no page reload needed)

### On Logout
1. User clicks "Odhlásit se" button
2. Profile data is cleared (`setUserProfile(null)`)
3. User is logged out and redirected
4. Profile card disappears

### State Management
```typescript
const [userProfile, setUserProfile] = useState<{
  userType?: string;
  schoolName?: string;
} | null>(null);

// Profile loads when:
- User logs in AND has completed registration
- User completes registration (onSuccess callback)

// Profile clears when:
- User logs out
```

## Implementation Files

- **Display Component**: `src/app/page.tsx` (lines 85-116)
- **Profile Fetching**: `src/lib/supabase/user-profile.ts`
- **Type Definitions**: `src/types/user.types.ts`

## Accessibility

- ✅ Semantic HTML structure
- ✅ Clear text hierarchy
- ✅ Sufficient color contrast
- ✅ Screen reader friendly
- ✅ Responsive design

## Mobile View

On mobile devices, the profile card scales appropriately:
- Max width constraint prevents stretching
- Text remains readable
- Padding adjusts for smaller screens
- All information visible without scrolling


# Display Name Feature

## Overview

Users can now set a display name during registration and edit it later in their profile settings. The display name is optional and can be:
- **Pre-filled from OAuth**: Automatically populated from OAuth providers (Google, Azure)
- **Manually entered**: Users can type their own name during registration
- **Edited later**: Changed anytime in profile settings
- **Optional**: Not required for registration

## Database Schema

### profiles Table - New Column

```sql
ALTER TABLE public.profiles 
ADD COLUMN display_name TEXT;

-- Maximum 32 characters constraint
ALTER TABLE public.profiles
ADD CONSTRAINT display_name_length CHECK (length(display_name) <= 32);
```

**Column Details:**
- **Name**: `display_name`
- **Type**: `TEXT` (nullable)
- **Max Length**: 32 characters
- **Default**: `NULL`
- **Editable**: Yes
- **Indexed**: Yes (for performance)

## Implementation

### 1. Registration Flow (CompleteRegistrationModal)

The display name field is now included in the registration modal:

```tsx
<div className="space-y-2">
  <Label htmlFor="display-name">
    Zobrazované jméno
  </Label>
  <Input
    id="display-name"
    type="text"
    placeholder="Vaše jméno (volitelné)"
    value={displayName}
    onChange={(e) => setDisplayName(e.target.value)}
    maxLength={32}
    disabled={isLoading}
  />
  <p className="text-xs text-gray-500">
    Toto jméno se zobrazí v profilu. Můžete jej změnit kdykoli v nastavení. Maximum 32 znaků.
  </p>
</div>
```

**Features:**
- Pre-filled with OAuth data (if available)
- Optional field (not required)
- Character counter (max 32)
- Helper text explaining the field
- Editable at any time

### 2. OAuth Pre-fill Logic

The `getDisplayNameFromAuth()` helper tries multiple sources:

```typescript
// Priority order:
1. full_name (Google, Azure)
2. name (generic providers)
3. first_name + last_name (combined)
4. email username (fallback)
```

**Example OAuth Metadata:**
```javascript
// Google OAuth
user.user_metadata = {
  full_name: "John Doe",
  email: "john@example.com"
}

// Azure OAuth
user.user_metadata = {
  name: "John Doe",
  email: "john@work.com"
}

// Email Registration
user.user_metadata = {} // Empty - no pre-fill
```

### 3. Profile Page (Future Implementation)

Example profile settings page structure:

```tsx
import { getUserProfile, updateDisplayName } from "@/lib/supabase/user-profile"

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const profile = await getUserProfile()
      if (profile?.displayName) {
        setDisplayName(profile.displayName)
      }
    }
    loadProfile()
  }, [])
  
  // Update display name
  async function handleSave() {
    setIsLoading(true)
    try {
      await updateDisplayName(displayName)
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div>
      <h2>Display name</h2>
      <Input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        maxLength={32}
        disabled={isLoading}
      />
      <p className="text-xs text-gray-500">
        Maximum allowed length is 32 characters.
      </p>
      <Button onClick={handleSave} disabled={isLoading}>
        Save
      </Button>
    </div>
  )
}
```

## API Functions

### Registration

```typescript
// Complete registration with display name
await completeRegistration({
  displayName: "John Doe", // Optional
  userType: "teacher",
  schoolName: "ZS Hlavateho, Praha",
  emailConsent: true
})
```

### Reading Profile

```typescript
// Get user profile including display name
const profile = await getUserProfile()
console.log(profile?.displayName) // "John Doe" or null
```

### Updating Display Name

```typescript
// Update only display name
await updateDisplayName("Jane Smith")

// Or update multiple fields
await updateProfile({
  displayName: "Jane Smith",
  emailConsent: true,
  schoolName: "New School Name"
})
```

## User Experience

### Registration Flow

1. **OAuth User**:
   - User logs in with Google/Azure
   - Display name field pre-filled with OAuth name
   - User can edit or keep it
   - User continues with registration

2. **Email User**:
   - User registers with email/password
   - Display name field is empty
   - User can optionally fill it in
   - User continues with registration

### Profile Settings (Future)

Based on the design mockup:

```
┌─────────────────────────────────────────┐
│ Profil                                  │
├─────────────────────────────────────────┤
│ Nastavení                               │
│ Moje upravené materiály                 │
├─────────────────────────────────────────┤
│ [Avatar Section]                        │
│ Avatar is your profile picture...       │
│ [Upload Button]                         │
├─────────────────────────────────────────┤
│ Display name                            │
│ Enter your full name or display name... │
│ ┌─────────────────────────────────────┐ │
│ │ Roland Magera                       │ │
│ └─────────────────────────────────────┘ │
│ Maximum allowed length is 32 characters │
│                           [Save] Button │
└─────────────────────────────────────────┘
```

## Validation Rules

- **Max Length**: 32 characters
- **Required**: No (optional field)
- **Allowed Characters**: Any UTF-8 characters (including Czech: ěščřžýáíé)
- **Trimming**: Leading/trailing spaces automatically removed
- **Empty Handling**: Empty strings converted to `NULL`

## Database Queries

### Insert/Update with Display Name

```sql
INSERT INTO profiles (id, email, display_name, user_type, ...)
VALUES ($1, $2, $3, $4, ...)
ON CONFLICT (id) 
DO UPDATE SET 
  display_name = $3,
  updated_at = NOW();
```

### Query with Display Name

```sql
SELECT id, email, display_name, user_type, ...
FROM profiles
WHERE id = $1;
```

## Security Considerations

- ✅ **RLS Policies**: Users can only view/edit their own display name
- ✅ **Length Validation**: Database constraint + application validation
- ✅ **Input Sanitization**: Trimming applied before storage
- ✅ **XSS Protection**: Display names rendered safely in React
- ✅ **Privacy**: Display name is private (not public)

## Future Enhancements

Potential improvements:
- [ ] Public profile pages (show display name)
- [ ] Username generation from display name
- [ ] Display name suggestions
- [ ] Character count indicator in real-time
- [ ] Display name history/audit log
- [ ] Profanity filter
- [ ] Unicode emoji support 🎉
- [ ] Display name validation (min length, format)

## Testing Checklist

### Registration Flow
- [ ] OAuth user sees pre-filled display name
- [ ] Email user sees empty display name field
- [ ] Can edit pre-filled display name
- [ ] Can leave display name empty
- [ ] 32 character limit enforced
- [ ] Display name saved correctly
- [ ] Display name appears in profile

### Profile Update
- [ ] Load existing display name
- [ ] Update display name successfully
- [ ] Validation works (max 32 chars)
- [ ] Empty display name allowed
- [ ] Changes persist after refresh
- [ ] Updated_at timestamp updates

### Edge Cases
- [ ] Very long names (31-32 chars)
- [ ] Names with special characters (ěščřžýáíé)
- [ ] Names with emojis
- [ ] Leading/trailing spaces trimmed
- [ ] NULL handling
- [ ] Concurrent updates

## Gravatar Integration (Future)

As mentioned in the design, avatar will use Gravatar:

```typescript
import md5 from 'crypto-js/md5'

function getGravatarUrl(email: string, size: number = 80): string {
  const hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
}

// Usage
<img src={getGravatarUrl(user.email)} alt={profile.displayName} />
```

## Migration History

- **Migration**: `..._add_display_name_to_profiles.sql`
- **Date**: 2025-01-24
- **Changes**:
  - Added `display_name` column
  - Added length constraint (32 chars)
  - Added index for performance
  - Added column comment

## Related Files

### Modified Files
- `src/types/database.types.ts` - Added display_name to types
- `src/types/user.types.ts` - Updated interfaces
- `src/lib/supabase/user-profile.ts` - Added display name handling
- `src/components/auth/CompleteRegistrationModal.tsx` - Added UI field
- `supabase/migrations/..._add_display_name_to_profiles.sql` - Database migration

### New Files
- `src/lib/supabase/user-helpers.ts` - OAuth display name extraction
- `docs/DISPLAY_NAME_FEATURE.md` - This documentation

## Support

For questions or issues:
1. Check this documentation
2. Review example code in `src/lib/supabase/user-profile.ts`
3. Test with OAuth and email registration flows
4. Verify database constraints are working


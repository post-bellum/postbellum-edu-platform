# Display Name - Quick Reference

## What's New

✅ **Display Name Field Added to Profiles**
- Optional field (not required)
- Max 32 characters
- Pre-fills from OAuth (Google, Azure)
- Editable during registration
- Can be updated later in profile settings

## For Developers

### Using in Registration Modal

Already integrated! The `CompleteRegistrationModal` now includes:

```tsx
<Input
  id="display-name"
  placeholder="Vaše jméno (volitelné)"
  value={displayName}
  maxLength={32}
/>
```

### Getting User Profile with Display Name

```typescript
import { getUserProfile } from "@/lib/supabase/user-profile"

const profile = await getUserProfile()
console.log(profile?.displayName) // "John Doe" or null
```

### Updating Display Name

```typescript
import { updateDisplayName } from "@/lib/supabase/user-profile"

// Update only display name
await updateDisplayName("Jane Smith")

// Or update multiple fields
import { updateProfile } from "@/lib/supabase/user-profile"
await updateProfile({
  displayName: "Jane Smith",
  emailConsent: true
})
```

### OAuth Pre-fill

Automatically handled! The modal uses:

```typescript
import { getDisplayNameFromAuth } from "@/lib/supabase/user-helpers"

const name = await getDisplayNameFromAuth()
// Returns name from OAuth or empty string
```

## Database

**Column**: `profiles.display_name`
- Type: TEXT
- Nullable: YES
- Max Length: 32 (enforced by constraint)
- Indexed: YES

**Query Example:**
```sql
SELECT id, email, display_name, user_type 
FROM profiles 
WHERE id = $1;
```

## Profile Page

The profile page is now available at `/profile`:
- **Route**: `src/app/profile/page.tsx`
- **Access**: Click "Upravit profil" button on home page when logged in
- **Features**: Edit display name, school name (teachers), view avatar (Gravatar)
- **Protected**: Automatically redirects to home if not logged in

## Reference Files

- **Documentation**: `docs/DISPLAY_NAME_FEATURE.md`
- **Implementation Summary**: `docs/DISPLAY_NAME_IMPLEMENTATION_SUMMARY.md`
- **Profile Page**: `src/app/profile/page.tsx`
- **Helper Functions**: `src/lib/supabase/user-helpers.ts`
- **Profile Functions**: `src/lib/supabase/user-profile.ts`

## Testing

```bash
# Start dev server
npm run dev

# Test OAuth flow
1. Click "Login with Google"
2. Check if display name is pre-filled
3. Edit or keep the name
4. Complete registration

# Test Email flow
1. Register with email/password
2. Check display name field is empty
3. Optionally fill it in
4. Complete registration
```

## Support

See full documentation in `docs/DISPLAY_NAME_FEATURE.md`


# Delete Account Feature

## Overview

Users can permanently delete their account from the profile settings page. This includes a safety confirmation dialog to prevent accidental deletions.

## User Experience

### 1. Delete Button Location
- **Page**: `/profile` (Profile Settings)
- **Section**: Bottom of page in red warning box
- **Label**: "Odstranit účet" (Delete account)

### 2. Confirmation Dialog

When user clicks "Odstranit účet", a modal appears requiring:

```
┌─────────────────────────────────────────┐
│ Opravdu chcete odstranit účet?         │
├─────────────────────────────────────────┤
│ Tato akce je NEVRATNÁ.                 │
│ Všechny vaše data budou trvale smazána:│
│                                         │
│ • Profilové údaje                       │
│ • Nastavení účtu                        │
│ • Historie aktivit                      │
├─────────────────────────────────────────┤
│ Pro potvrzení napište: ODSTRANIT       │
│ ┌─────────────────────────────────────┐ │
│ │ [Input field]                       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ [Zrušit]           [Odstranit účet]    │
└─────────────────────────────────────────┘
```

### 3. Confirmation Requirement

- User must type exactly: **`ODSTRANIT`** (uppercase)
- Delete button is disabled until correct text is entered
- Case-sensitive validation

### 4. Deletion Process

1. User types "ODSTRANIT"
2. Clicks "Odstranit účet" button
3. Button shows "Odstraňuji..." loading state
4. Account is deleted
5. User is automatically signed out
6. Redirected to home page

## Implementation

### Files

**Profile Page**: `src/app/profile/page.tsx`
- Handles UI and user interaction
- Shows confirmation dialog
- Calls deletion function

**Deletion Logic**: `src/lib/supabase/account-deletion.ts`
- `deleteUserAccount()` - Main deletion function
- `canDeleteAccount()` - Pre-deletion checks (extensible)

### Current Behavior

```typescript
// What happens when user deletes account:
1. Delete profile from profiles table
2. Sign out user
3. Redirect to home page
```

### Database Structure

The `profiles` table has this constraint:

```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
```

This means:
- If `auth.users` is deleted → profile automatically deleted
- If `profiles` is deleted → auth.users remains (current behavior)

## Security & Safety Features

### ✅ Implemented
- **Confirmation Dialog** - Prevents accidental clicks
- **Text Confirmation** - User must type "ODSTRANIT"
- **Case Sensitive** - Must be exact match
- **Loading State** - Shows "Odstraňuji..." during deletion
- **Error Handling** - Shows error message if deletion fails
- **Auto Sign Out** - User is logged out after deletion
- **Auto Redirect** - Sent to home page

### 🔒 RLS (Row Level Security)
Users can only delete their own profile:
```sql
-- Policy: Users can delete own profile
CREATE POLICY "Users can delete own profile" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = id);
```

## Production Considerations

### Full Account Deletion

For **complete** account deletion (including `auth.users`):

**Option 1: Server Action (Recommended)**

Create a server action with admin privileges:

```typescript
// src/app/actions/delete-account.ts
'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function deleteAccount() {
  // Get user from cookies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key
    { /* ... */ }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Delete from auth.users (cascade deletes profile)
  await supabase.auth.admin.deleteUser(user.id)
}
```

**Option 2: Edge Function**

Create a Supabase Edge Function:

```typescript
// supabase/functions/delete-account/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get user from auth header
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return new Response('Unauthorized', { status: 401 })
  
  // Delete user (cascades to profile)
  await supabaseAdmin.auth.admin.deleteUser(user.id)
  
  return new Response('Account deleted', { status: 200 })
})
```

**Option 3: Database Function**

Create a PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from auth.users (cascades to profiles)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
```

### Pre-Deletion Checks

Extend `canDeleteAccount()` to check for:

```typescript
export async function canDeleteAccount(): Promise<{ 
  canDelete: boolean
  reason?: string 
}> {
  // Check if user has active subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
  
  if (subscriptions && subscriptions.length > 0) {
    return { 
      canDelete: false, 
      reason: "Máte aktivní předplatné. Nejprve ho prosím zrušte." 
    }
  }
  
  // Check if user owns resources that need transfer
  const { data: ownedResources } = await supabase
    .from('resources')
    .select('id')
    .eq('owner_id', userId)
  
  if (ownedResources && ownedResources.length > 0) {
    return { 
      canDelete: false, 
      reason: "Vlastníte materiály. Převeďte je nebo smažte před odstraněním účtu." 
    }
  }
  
  return { canDelete: true }
}
```

## Testing

### Manual Testing Checklist

- [ ] Click "Odstranit účet" button
- [ ] Verify confirmation dialog appears
- [ ] Try clicking delete without typing confirmation
- [ ] Verify button is disabled
- [ ] Type wrong text (e.g., "odstranit" lowercase)
- [ ] Verify validation error
- [ ] Type correct text "ODSTRANIT"
- [ ] Verify button becomes enabled
- [ ] Click "Zrušit" and verify dialog closes
- [ ] Open dialog again and complete deletion
- [ ] Verify loading state appears
- [ ] Verify redirect to home page
- [ ] Verify user is signed out
- [ ] Try accessing `/profile` again
- [ ] Verify redirect to home (not logged in)
- [ ] Try logging in with deleted account
- [ ] Verify profile is deleted from database

### Test Account Deletion

```typescript
// Test helper
async function testDeleteAccount() {
  // 1. Create test user
  const testEmail = `test-${Date.now()}@example.com`
  await signUp(testEmail, 'password123')
  
  // 2. Complete registration
  await completeRegistration({ /* ... */ })
  
  // 3. Verify profile exists
  const profile = await getUserProfile()
  expect(profile).toBeTruthy()
  
  // 4. Delete account
  await deleteUserAccount()
  
  // 5. Verify profile deleted
  const deletedProfile = await getUserProfile()
  expect(deletedProfile).toBeNull()
}
```

## Future Enhancements

### Soft Delete (Optional)

Instead of hard delete, mark as deleted:

```sql
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deletion_reason TEXT;

-- Update RLS to exclude deleted profiles
CREATE POLICY "Hide deleted profiles"
  ON profiles
  FOR SELECT
  USING (deleted_at IS NULL);
```

Benefits:
- Recovery window (30 days)
- Audit trail
- Compliance requirements
- Prevent username reuse

### Deletion Cooldown

Add a cooldown period:

```typescript
// Mark for deletion instead of immediate delete
await supabase
  .from('profiles')
  .update({ 
    deletion_scheduled_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  })
  .eq('id', userId)

// User can cancel during cooldown
// After 30 days, cron job actually deletes
```

### Deletion Confirmation Email

Send email before deletion:

```typescript
// After successful deletion request
await sendEmail({
  to: user.email,
  subject: 'Potvrzení odstranění účtu',
  body: `
    Váš účet byl naplánován k odstranění.
    Účet bude odstraněn za 30 dní.
    Pro zrušení klikněte zde: ${cancelUrl}
  `
})
```

## Support & Troubleshooting

### Common Issues

**Issue**: "Nepodařilo se odstranit účet"
- Check console for errors
- Verify user is authenticated
- Check RLS policies
- Verify database connection

**Issue**: User can still log in after deletion
- Profile deleted, but auth.users remains
- Implement full deletion (see Production Considerations)

**Issue**: Confirmation text doesn't work
- Must be exact: "ODSTRANIT" (uppercase)
- Case sensitive
- No extra spaces

### Recovery

If user accidentally deletes account:
1. Check if soft delete is enabled
2. Contact admin to restore from backup
3. If hard deleted, data is permanently lost

## Compliance

### GDPR
- ✅ Right to erasure implemented
- ✅ Confirmation required
- ✅ Immediate deletion
- ⚠️  Consider adding data export before deletion

### Data Retention
- Profile data: Deleted immediately
- Auth data: Depends on implementation
- Backups: May retain data per backup policy

## Related Files

- `src/app/profile/page.tsx` - UI implementation
- `src/lib/supabase/account-deletion.ts` - Deletion logic
- `src/components/ui/Dialog.tsx` - Confirmation dialog component
- `supabase/migrations/20250121120000_create_profiles_table.sql` - Database schema


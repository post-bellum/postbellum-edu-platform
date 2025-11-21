# Profiles Table Implementation Guide

## Overview

User registration data is saved to the **profiles table only** - our single source of truth.

This clean approach:
- ✅ Eliminates data sync issues
- ✅ Provides full analytics capabilities  
- ✅ Keeps code simple and maintainable
- ✅ Uses proper database constraints

## Why Profiles Table Only?

### Profiles Table (public.profiles) - Single Source of Truth
✅ **Pros:**
- **Can query for stats** (main reason!)
- Proper database structure with constraints
- Separate fields for school_name and category (cleaner)
- Indexable for performance
- Easy to export data
- Can add more fields easily
- No data sync issues!
- One place to update

⚠️ **Cons:**
- One extra database query (~10-20ms)

### Why Not User Metadata?
❌ Cannot query across users
❌ No analytics possible
❌ Limited to JSON data
❌ No data validation/constraints
❌ Harder to maintain

### Our Solution: Profiles Table Only! 🎯
- Single source of truth
- Clean, validated data structure
- Full analytics capabilities
- No sync complexity

## Setup Steps

### Step 1: Run the Migration

Go to your Supabase dashboard:

1. Click **SQL Editor**
2. Click **New Query**
3. Copy the content from `supabase/migrations/20250121120000_create_profiles_table.sql`
4. Click **Run** or press Cmd/Ctrl + Enter
5. Verify success message appears

### Step 2: Verify the Table

Run this query to check:

```sql
SELECT * FROM public.profiles LIMIT 5;
```

If it returns (empty table or rows), you're good! ✅

### Step 3: Test with a New User

1. Log in with Google OAuth
2. Complete the registration modal
3. Check the profiles table:

```sql
SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 1;
```

You should see your new profile! 🎉

## How It Works

### On Registration Complete

```typescript
// Save to profiles table (single source of truth)
await supabase.from('profiles').upsert({
  id: user.id,
  email: user.email,
  user_type: "teacher", // or "not-teacher"
  school_name: "School Name", // For teachers only
  category: null, // For non-teachers only (founder/partner/parent/other)
  email_consent: true,
  registration_completed: true,
})
```

### On Profile Fetch

```typescript
// Get from profiles table (single source of truth)
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

return {
  userType: profile.user_type,
  schoolName: profile.school_name, // For teachers
  category: profile.category, // For non-teachers
  // ...
}
```

## Analytics Examples

### Quick Stats

```sql
-- How many teachers vs non-teachers?
SELECT user_type, COUNT(*) 
FROM profiles 
GROUP BY user_type;
```

### Top 10 Schools

```sql
-- Which schools have the most teachers?
SELECT school_name, COUNT(*) as count
FROM profiles
WHERE user_type = 'teacher'
GROUP BY school_name
ORDER BY count DESC
LIMIT 10;
```

### Growth Over Time

```sql
-- New users by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users
FROM profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### Email Consent Rate

```sql
-- What % of users opted in to emails?
SELECT 
  email_consent,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY email_consent;
```

**See `supabase/analytics_queries.sql` for 20+ more queries!**

## Database Schema

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,              -- References auth.users
  email TEXT,                       -- User's email
  user_type TEXT NOT NULL,          -- "teacher" | "not-teacher"
  school_name TEXT,                 -- For teachers only
  category TEXT,                    -- For non-teachers: founder/partner/parent/other
  email_consent BOOLEAN,            -- Marketing consent
  registration_completed BOOLEAN,   -- Always true
  created_at TIMESTAMPTZ,          -- Registration date
  updated_at TIMESTAMPTZ,          -- Last update
  
  -- Data integrity constraint
  CONSTRAINT check_teacher_data CHECK (
    (user_type = 'teacher' AND school_name IS NOT NULL AND category IS NULL) OR
    (user_type = 'not-teacher' AND category IS NOT NULL AND school_name IS NULL)
  )
);
```

This constraint ensures:
- Teachers MUST have school_name, CANNOT have category
- Non-teachers MUST have category, CANNOT have school_name
- Invalid data combinations are rejected by the database

## Security (RLS Policies)

Users can only:
- ✅ View their own profile
- ✅ Insert their own profile
- ✅ Update their own profile
- ❌ View other users' profiles
- ❌ Delete profiles

Admins (service_role) can read all profiles for analytics.

## Indexes for Performance

```sql
-- Fast queries on user_type
CREATE INDEX idx_profiles_user_type ON profiles(user_type);

-- Fast queries on created_at (for growth stats)
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
```

## Code Changes Made

### Updated Files

1. **`src/lib/supabase/user-profile.ts`**
   - `completeRegistration()` - Now saves to both locations
   - `getUserProfile()` - Now reads from profiles table first

### No Changes Needed

- ✅ `CompleteRegistrationModal` - Works as-is
- ✅ `page.tsx` - Works as-is  
- ✅ All other components - Work as-is

The change is **completely transparent** to the rest of the app! 🎯

## Error Handling

If saving to profiles table fails:
- ❌ Registration will fail (by design)
- ✅ User sees error message
- ✅ User can retry registration
- ✅ Data integrity is maintained

This ensures we always have complete, valid data in the database.

## Future Enhancements

Now that you have the profiles table, you can easily:

### 1. Admin Dashboard
```typescript
// Get all users (admin only, using service role)
const { data: allProfiles } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false })
```

### 2. Export Data
```sql
-- Export to CSV via Supabase dashboard
SELECT * FROM profiles;
-- Click "Export as CSV"
```

### 3. Add More Fields
```sql
-- Example: Add subject field for teachers
ALTER TABLE profiles ADD COLUMN subject TEXT;
```

### 4. Integration with Analytics Tools
- Connect Supabase to Metabase, Tableau, etc.
- Direct SQL access for reporting
- GraphQL API for dashboards

## Troubleshooting

### Issue: Table doesn't exist
**Solution:** Run the migration SQL in Supabase dashboard

### Issue: Permission denied
**Solution:** Check RLS policies are enabled and correct

### Issue: Old users don't have profiles
**Solution:** They'll be created on next login (metadata fallback works)

### Issue: Need to migrate existing users
**Solution:** Run this query:

```sql
-- Migrate existing users from auth to profiles
-- (If you had users before running migration)
INSERT INTO profiles (id, email, user_type, school_name, email_consent)
SELECT 
  id,
  email,
  (raw_user_meta_data->>'user_type')::text,
  (raw_user_meta_data->>'school_name')::text,
  COALESCE((raw_user_meta_data->>'email_consent')::boolean, false)
FROM auth.users
WHERE raw_user_meta_data->>'registration_completed' = 'true'
ON CONFLICT (id) DO NOTHING;
```

## Summary

✅ **Simple** - Only 2 extra lines of code  
✅ **Backwards Compatible** - Metadata fallback works  
✅ **Powerful** - Full analytics capabilities  
✅ **Safe** - Errors don't break the app  
✅ **Scalable** - Easy to add features later  

You now have the best of both worlds! 🚀


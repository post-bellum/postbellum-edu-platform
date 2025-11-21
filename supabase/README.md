# Supabase Migrations

This directory contains SQL migrations for your Supabase database.

## Migration Naming Convention

Migrations use timestamp-based naming:
```
YYYYMMDDHHMMSS_descriptive_name.sql
20250121120000_create_profiles_table.sql
```

**Benefits:**
- ✅ Chronological order guaranteed
- ✅ No merge conflicts (unique timestamps)
- ✅ Know when migration was created
- ✅ Standard format used by Supabase CLI

## Running Migrations

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the content of `migrations/20250121120000_create_profiles_table.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Migrations

### 20250121120000_create_profiles_table.sql

Creates the `profiles` table for storing user registration data.

**What it does:**
- Creates `profiles` table with user data
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Adds auto-updating timestamp
- Grants necessary permissions

**Fields:**
- `id` (UUID) - References auth.users, primary key
- `email` (TEXT) - User's email
- `user_type` (TEXT) - "teacher" or "not-teacher"
- `school_name` (TEXT) - School name or category
- `email_consent` (BOOLEAN) - Email marketing consent
- `registration_completed` (BOOLEAN) - Registration status
- `created_at` (TIMESTAMPTZ) - When profile was created
- `updated_at` (TIMESTAMPTZ) - When profile was last updated

## After Running Migration

The application will automatically:
1. Save user data to both `user_metadata` AND `profiles` table
2. Read from `profiles` table (with fallback to metadata)
3. Continue working exactly as before

No code changes needed - it just works! ✅

## Verifying the Migration

After running the migration, test it in the SQL Editor:

```sql
-- Check if table exists
SELECT * FROM public.profiles LIMIT 5;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## Need Help?

- [Supabase SQL Editor Docs](https://supabase.com/docs/guides/database/sql-editor)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)


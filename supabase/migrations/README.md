# Database Migrations

This directory contains SQL migration files for the Postbellum EDU Platform database.

## Migration Files

### 20250121120000_create_profiles_table.sql
**Initial profiles table creation**

Creates the main `profiles` table with:
- User profile data (email, display_name, user_type)
- Teacher data (school_name)
- Non-teacher data (category)
- Email consent tracking
- Registration completion status
- Timestamps (created_at, updated_at)

**Includes:**
- ✅ display_name column (max 32 chars)
- ✅ RLS policies (users can only access their own profile)
- ✅ Indexes for performance
- ✅ Auto-update trigger for updated_at
- ✅ Data integrity constraints

## Running Migrations

### Fresh Database Setup

For a fresh database, simply run all migrations in order:

```bash
# Using Supabase CLI
supabase db reset

# Or manually apply migrations
supabase db push
```

The migration will create the profiles table with display_name included.

### Existing Database

If you already have a database running and need to add the display_name column, you can run:

```sql
-- Add display_name if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Add length constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT display_name_length CHECK (length(display_name) <= 32);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Add comment
COMMENT ON COLUMN public.profiles.display_name IS 'User display name - can be pre-filled from OAuth or set manually. Maximum 32 characters. Editable in profile settings.';
```

### Checking Applied Migrations

To see which migrations have been applied:

```sql
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

Or using Supabase CLI:
```bash
supabase migration list
```

## Migration Best Practices

1. **Never modify existing migrations** that have been applied to production
2. **Always create new migrations** for schema changes
3. **Use IF NOT EXISTS** for idempotent operations
4. **Test migrations** on a local/staging database first
5. **Keep migrations small** and focused on one change
6. **Add comments** explaining why the change is needed

## Rolling Back

To roll back the last migration:

```bash
supabase db reset
```

**Warning:** This will reset your entire database to the initial state and re-run all migrations.

## Creating New Migrations

To create a new migration:

```bash
# Using Supabase CLI
supabase migration new your_migration_name

# This creates: supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql
```

## Database Structure Overview

```
profiles
├── id (UUID, PK) → references auth.users
├── email (TEXT)
├── display_name (TEXT, max 32 chars)
├── user_type (TEXT: 'teacher' | 'not-teacher')
├── school_name (TEXT, for teachers only)
├── category (TEXT, for non-teachers only)
├── email_consent (BOOLEAN)
├── registration_completed (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

schools
├── schoolId (BIGINT, PK)
├── "Plný název" (TEXT) ← searchable
├── "Místo" (TEXT)
├── "Kraj" (TEXT)
└── ... other columns
```

## Troubleshooting

### Migration Already Applied
If you see "migration already applied" errors, the migration has already been run. This is normal and safe.

### Column Already Exists
If you see "column already exists" errors, check if the column was manually added or if migrations are out of sync.

### Reset Database
To completely reset and reapply all migrations:

```bash
supabase db reset
```

**Warning:** This deletes all data!

### Check Database State
To verify the current database schema:

```sql
-- Check profiles table structure
\d profiles

-- Check applied migrations
SELECT * FROM supabase_migrations.schema_migrations;
```

## Support

For questions or issues with migrations:
1. Check this README
2. Review the migration SQL files
3. Verify applied migrations: `supabase migration list`
4. Test on local database first: `supabase db reset`


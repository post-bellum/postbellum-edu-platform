# Database & Supabase Rules

## Supabase Patterns

### Database Queries
```typescript
// Always type your queries
const { data, error } = await supabase
  .from('lessons')
  .select(`
    id,
    title,
    description,
    materials:lesson_materials(id, type, content)
  `)
  .eq('published', true)
  .order('created_at', { ascending: false });

if (error) {
  // Always handle errors
  console.error('Error fetching lessons:', error);
  return null;
}
```

### Row Level Security (RLS)
- ALWAYS enable RLS on all tables
- Write policies for authenticated and public access
- Test policies thoroughly
- Use service role key only in server-side code

### Authentication
```typescript
// Check auth state in Server Components
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabase = createServerComponentClient({ cookies });
const { data: { user } } = await supabase.auth.getUser();
```

## Database Schema Conventions

### Table Naming
- Use snake_case for table names
- Use plural forms (lessons, users, materials)
- Prefix junction tables with both table names (user_favorites)

### Column Naming
- Use snake_case for column names
- Use id as primary key
- Add created_at and updated_at timestamps
- Use _id suffix for foreign keys

### Example Schema
```sql
-- Lessons table
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration INTEGER,
  age_group TEXT,
  historical_period TEXT,
  topics TEXT[],
  rvp_tags TEXT[],
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy Example
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Lessons are editable by admins"
  ON lessons FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

## File Storage
- Use Supabase Storage for file hosting
- Organize buckets by content type (avatars, materials, videos)
- Implement proper access policies
- Generate unique file names to prevent conflicts
- Use presigned URLs for temporary access

## Real-time Features
- Use Supabase Realtime sparingly
- Implement proper cleanup for subscriptions
- Handle connection failures gracefully
- Consider performance implications

## Migrations
- Place migrations in `supabase/migrations/`
- Use descriptive file names with timestamps
- Always include rollback statements
- Test migrations in development first

## Performance Optimization
- Create indexes on frequently queried columns
- Use database views for complex queries
- Implement connection pooling
- Monitor query performance
- Use EXPLAIN ANALYZE for optimization

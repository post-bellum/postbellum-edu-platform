# Data Model: User Profiles

## Overview

User registration data is stored in the `profiles` table with a clean, validated structure that separates teacher and non-teacher data.

## Table Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      profiles table                             │
├─────────────────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY (→ auth.users)             │
│ email               TEXT                                        │
│ user_type           TEXT NOT NULL ("teacher" | "not-teacher")  │
│ school_name         TEXT (teachers only)                        │
│ category            TEXT (non-teachers only)                    │
│ email_consent       BOOLEAN                                     │
│ registration_completed BOOLEAN                                  │
│ created_at          TIMESTAMPTZ                                 │
│ updated_at          TIMESTAMPTZ                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Integrity Constraint

```sql
CHECK (
  (user_type = 'teacher' AND school_name IS NOT NULL AND category IS NULL) OR
  (user_type = 'not-teacher' AND category IS NOT NULL AND school_name IS NULL)
)
```

This ensures:
- ✅ Teachers always have `school_name`, never have `category`
- ✅ Non-teachers always have `category`, never have `school_name`
- ❌ Invalid combinations are rejected by the database

## Example Data

### Teacher Profile

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "teacher@school.cz",
  "user_type": "teacher",
  "school_name": "Základní škola Masarykova",
  "category": null,
  "email_consent": true,
  "registration_completed": true,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Non-Teacher Profile (Parent)

```json
{
  "id": "987fcdeb-51a2-43f7-8765-ba9876543210",
  "email": "parent@email.cz",
  "user_type": "not-teacher",
  "school_name": null,
  "category": "parent",
  "email_consent": false,
  "registration_completed": true,
  "created_at": "2025-01-16T14:20:00Z",
  "updated_at": "2025-01-16T14:20:00Z"
}
```

### Non-Teacher Profile (Partner)

```json
{
  "id": "456def78-90ab-12cd-3456-ef7890abcdef",
  "email": "partner@postbellum.cz",
  "user_type": "not-teacher",
  "school_name": null,
  "category": "partner",
  "email_consent": true,
  "registration_completed": true,
  "created_at": "2025-01-17T09:15:00Z",
  "updated_at": "2025-01-17T09:15:00Z"
}
```

## Category Values (Non-Teachers)

| Value | Display Label (Czech) | English Meaning |
|-------|----------------------|-----------------|
| `founder` | Zřizovatel a další organizace zaměřující se na vzdělávání | School founder / education organization |
| `partner` | Partner nebo projekty Post Bellum | Post Bellum partner/project member |
| `parent` | Rodič | Parent |
| `other` | Ostatní | Other |

## Indexes

For optimal query performance:

```sql
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_category ON profiles(category);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_email_consent ON profiles(email_consent);
```

## Common Queries

### Count users by type
```sql
SELECT user_type, COUNT(*) 
FROM profiles 
GROUP BY user_type;
```

### Top 10 schools
```sql
SELECT school_name, COUNT(*) as count
FROM profiles
WHERE user_type = 'teacher'
GROUP BY school_name
ORDER BY count DESC
LIMIT 10;
```

### Category distribution (non-teachers)
```sql
SELECT category, COUNT(*) as count
FROM profiles
WHERE user_type = 'not-teacher'
GROUP BY category
ORDER BY count DESC;
```

### New registrations this week
```sql
SELECT COUNT(*) as new_users
FROM profiles
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### Email consent rate
```sql
SELECT 
  email_consent,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY email_consent;
```

## Security (RLS Policies)

### Users can view their own profile
```sql
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);
```

### Users can insert their own profile
```sql
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### Users can update their own profile
```sql
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## TypeScript Types

```typescript
interface UserProfile {
  id: string
  email: string
  user_type: "teacher" | "not-teacher"
  school_name: string | null
  category: "founder" | "partner" | "parent" | "other" | null
  email_consent: boolean
  registration_completed: boolean
  created_at: string
  updated_at: string
}

interface CompleteRegistrationData {
  userType: "teacher" | "not-teacher"
  schoolName?: string  // For teachers
  category?: "founder" | "partner" | "parent" | "other"  // For non-teachers
  emailConsent: boolean
}
```

## Benefits of This Structure

✅ **Clean separation** - Teachers and non-teachers have dedicated fields  
✅ **Data validation** - Database constraints prevent invalid data  
✅ **Type safety** - TypeScript types match database schema  
✅ **Easy analytics** - Separate fields make queries simpler  
✅ **Maintainable** - Clear structure is easy to understand  
✅ **Scalable** - Easy to add more fields or categories later  

## Future Extensions

### Easy to Add:
- Subject taught (for teachers)
- Grade levels (for teachers)
- Region/district
- Phone number
- Notification preferences
- Last login timestamp
- Account status

### Example:
```sql
ALTER TABLE profiles ADD COLUMN subjects TEXT[];
ALTER TABLE profiles ADD COLUMN grade_levels TEXT[];
ALTER TABLE profiles ADD COLUMN region TEXT;
```


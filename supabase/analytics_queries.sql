-- Analytics Queries for User Profiles
-- Run these in Supabase SQL Editor to get insights

-- ============================================================================
-- USER STATISTICS
-- ============================================================================

-- Total users by type
SELECT 
  user_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY user_type;

-- Example output:
-- user_type    | count | percentage
-- teacher      |   150 |      75.00
-- not-teacher  |    50 |      25.00


-- ============================================================================
-- TEACHER STATISTICS
-- ============================================================================

-- Most common schools (for teachers)
SELECT 
  school_name,
  COUNT(*) as teacher_count
FROM profiles
WHERE user_type = 'teacher'
GROUP BY school_name
ORDER BY teacher_count DESC
LIMIT 10;


-- ============================================================================
-- NON-TEACHER CATEGORIES
-- ============================================================================

-- Count by category (for non-teachers)
SELECT 
  category,
  COUNT(*) as count,
  CASE category
    WHEN 'student' THEN 'student/ka'
    WHEN 'parent' THEN 'rodič'
    WHEN 'educational_professional' THEN 'odborná veřejnost ve vzdělávání'
    WHEN 'ngo_worker' THEN 'pracovník/pracovnice v neziskovém a nevládním sektoru'
    WHEN 'public_sector_worker' THEN 'pracovník/pracovnice ve státním sektoru'
    WHEN 'other' THEN 'ostatní'
    ELSE category
  END as category_label
FROM profiles
WHERE user_type = 'not-teacher'
GROUP BY category
ORDER BY count DESC;


-- ============================================================================
-- EMAIL CONSENT STATISTICS
-- ============================================================================

-- Email consent rate
SELECT 
  email_consent,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles
GROUP BY email_consent;


-- Email consent by user type
SELECT 
  user_type,
  email_consent,
  COUNT(*) as count
FROM profiles
GROUP BY user_type, email_consent
ORDER BY user_type, email_consent;


-- ============================================================================
-- TIME-BASED STATISTICS
-- ============================================================================

-- New users by day (last 30 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM profiles
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;


-- New users by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users
FROM profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;


-- Users by weekday
SELECT 
  TO_CHAR(created_at, 'Day') as day_of_week,
  COUNT(*) as count
FROM profiles
GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
ORDER BY EXTRACT(DOW FROM created_at);


-- ============================================================================
-- GROWTH METRICS
-- ============================================================================

-- Cumulative user growth
SELECT 
  DATE(created_at) as date,
  COUNT(*) as new_users,
  SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
FROM profiles
GROUP BY DATE(created_at)
ORDER BY date;


-- ============================================================================
-- COMBINED INSIGHTS
-- ============================================================================

-- Summary dashboard
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE user_type = 'teacher') as teachers,
  COUNT(*) FILTER (WHERE user_type = 'not-teacher') as non_teachers,
  COUNT(*) FILTER (WHERE email_consent = true) as opted_in_emails,
  ROUND(
    COUNT(*) FILTER (WHERE email_consent = true) * 100.0 / COUNT(*),
    2
  ) as email_consent_rate,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_last_month
FROM profiles;


-- ============================================================================
-- EXPORT QUERIES
-- ============================================================================

-- Export all profiles with readable labels
SELECT 
  id,
  email,
  CASE user_type
    WHEN 'teacher' THEN 'Učitel'
    WHEN 'not-teacher' THEN 'Nejsem učitel'
    ELSE user_type
  END as user_type_label,
  CASE 
    WHEN user_type = 'teacher' THEN school_name
    WHEN category = 'student' THEN 'student/ka'
    WHEN category = 'parent' THEN 'rodič'
    WHEN category = 'educational_professional' THEN 'odborná veřejnost ve vzdělávání'
    WHEN category = 'ngo_worker' THEN 'pracovník/pracovnice v neziskovém a nevládním sektoru'
    WHEN category = 'public_sector_worker' THEN 'pracovník/pracovnice ve státním sektoru'
    WHEN category = 'other' THEN 'ostatní'
    ELSE NULL
  END as school_or_category,
  email_consent,
  created_at::date as registration_date
FROM profiles
ORDER BY created_at DESC;


-- ============================================================================
-- DATA VALIDATION
-- ============================================================================

-- Check for any data issues
SELECT 
  'Teachers missing school_name' as issue,
  COUNT(*) as count
FROM profiles
WHERE user_type = 'teacher' AND (school_name IS NULL OR school_name = '')
UNION ALL
SELECT 
  'Non-teachers missing category' as issue,
  COUNT(*) as count
FROM profiles
WHERE user_type = 'not-teacher' AND category IS NULL
UNION ALL
SELECT 
  'Invalid user_type' as issue,
  COUNT(*) as count
FROM profiles
WHERE user_type NOT IN ('teacher', 'not-teacher')
UNION ALL
SELECT 
  'Invalid category' as issue,
  COUNT(*) as count
FROM profiles
WHERE category IS NOT NULL AND category NOT IN ('student', 'parent', 'educational_professional', 'ngo_worker', 'public_sector_worker', 'other')
UNION ALL
SELECT 
  'Missing email' as issue,
  COUNT(*) as count
FROM profiles
WHERE email IS NULL OR email = '';


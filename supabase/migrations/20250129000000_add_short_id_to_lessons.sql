-- Add short_id column to lessons table for SEO-friendly URLs
-- Following industry standard (Medium, Amazon) with 10-character alphanumeric IDs

-- Add short_id column
ALTER TABLE lessons ADD COLUMN short_id VARCHAR(12) UNIQUE;

-- Add index for fast lookups
CREATE INDEX idx_lessons_short_id ON lessons(short_id);

-- Add comment explaining the column
COMMENT ON COLUMN lessons.short_id IS 'Short alphanumeric ID for SEO-friendly URLs (e.g., k5b8x2p9m1).';

-- Backfill short_id for existing lessons
-- Uses a combination of md5 hash for randomness, filtered to lowercase alphanumeric only
-- This generates 10-character IDs matching the nanoid pattern used in the application
UPDATE lessons 
SET short_id = substring(
  translate(
    lower(md5(random()::text || id::text || created_at::text)),
    'ghijklmnopqrstuvwxyz', -- Remove letters not in our charset (md5 only has a-f)
    ''
  ) || 
  substring(md5(id::text || random()::text), 1, 10), -- Add more chars to ensure length
  1, 10
)
WHERE short_id IS NULL;

-- Ensure all backfilled IDs are unique by regenerating any duplicates
-- This is a safety net - collisions are extremely unlikely with 10-char IDs
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN 
    SELECT id FROM lessons l1 
    WHERE EXISTS (
      SELECT 1 FROM lessons l2 
      WHERE l2.short_id = l1.short_id AND l2.id != l1.id
    )
  LOOP
    UPDATE lessons 
    SET short_id = substring(md5(random()::text || duplicate_record.id::text), 1, 10)
    WHERE id = duplicate_record.id;
  END LOOP;
END $$;

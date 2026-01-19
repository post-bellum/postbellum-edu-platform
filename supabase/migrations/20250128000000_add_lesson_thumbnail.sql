-- Add thumbnail_url column to lessons table
-- This stores the URL to the lesson's cover/thumbnail image

ALTER TABLE lessons ADD COLUMN thumbnail_url TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN lessons.thumbnail_url IS 'URL to the lesson thumbnail/cover image for display in lesson lists';

-- Add attachment_type to additional_activities (image | pdf)
-- Nullable for backward compatibility; app treats NULL as 'image'
ALTER TABLE public.additional_activities
  ADD COLUMN IF NOT EXISTS attachment_type TEXT
  CHECK (attachment_type IS NULL OR attachment_type IN ('image', 'pdf'));

COMMENT ON COLUMN public.additional_activities.attachment_type IS 'Type of attached file: image or pdf. NULL = legacy image_url only (treated as image).';

-- Extend lesson-materials bucket to allow PDFs for additional activity uploads
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf']::text[]
WHERE id = 'lesson-materials';

-- Create storage bucket for lesson materials (images, documents, etc.)
-- This bucket stores images uploaded through the rich text editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-materials',
  'lesson-materials',
  true, -- Public bucket so images can be accessed via URL
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view/download files from the bucket (public access)
CREATE POLICY "Public can view lesson materials"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'lesson-materials');

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload lesson materials"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lesson-materials');

-- Policy: Authenticated users can update their own uploads
CREATE POLICY "Authenticated users can update lesson materials"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lesson-materials')
  WITH CHECK (bucket_id = 'lesson-materials');

-- Policy: Only admins can delete files
-- This prevents users from accidentally deleting images used in lessons
CREATE POLICY "Admins can delete lesson materials"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lesson-materials'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );


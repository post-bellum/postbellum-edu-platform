-- Create storage bucket for page content images (team photos, partner logos, feature icons, etc.)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'page-content',
  'page-content',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public can view page content images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'page-content');

-- Only admins can upload
CREATE POLICY "Admins can upload page content images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'page-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update
CREATE POLICY "Admins can update page content images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'page-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    bucket_id = 'page-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete page content images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'page-content'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

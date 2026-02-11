-- Create page_content table for admin-editable page content
-- Each page (homepage, about, terms) gets exactly one row
-- Content is stored as JSONB with page-specific structure

CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  CONSTRAINT valid_page_slug CHECK (page_slug IN ('homepage', 'about', 'terms'))
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read page content (public pages)
CREATE POLICY "Anyone can read page content"
  ON public.page_content
  FOR SELECT
  USING (true);

-- Only admins can insert page content
CREATE POLICY "Admins can insert page content"
  ON public.page_content
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update page content
CREATE POLICY "Admins can update page content"
  ON public.page_content
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete page content
CREATE POLICY "Admins can delete page content"
  ON public.page_content
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Grants
GRANT SELECT ON public.page_content TO anon;
GRANT SELECT ON public.page_content TO authenticated;
GRANT ALL ON public.page_content TO service_role;

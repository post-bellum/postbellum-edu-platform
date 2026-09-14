-- Create lesson_witnesses table
-- Witnesses ("pamětníci") featured in a lesson's story. Rendered on the lesson
-- detail page as a horizontal row of cards; each card opens a detail modal with
-- a short biography and a link to the witness's profile on pametnaroda.cz.

-- Ensure uuid_generate_v4() is findable (Supabase installs it in extensions schema)
SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS public.lesson_witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role_short TEXT,
  role_full TEXT,
  birth_year SMALLINT,
  bio TEXT,
  portrait_url TEXT,
  memory_of_nations_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT lesson_witnesses_birth_year_check
    CHECK (birth_year IS NULL OR birth_year BETWEEN 1850 AND 2100)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_witnesses ENABLE ROW LEVEL SECURITY;

-- Policy: Public can only view witnesses for published lessons
DROP POLICY IF EXISTS "Public can view lesson_witnesses for published lessons" ON public.lesson_witnesses;
CREATE POLICY "Public can view lesson_witnesses for published lessons"
  ON public.lesson_witnesses
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_witnesses.lesson_id
      AND lessons.published = true
    )
  );

-- Policy: Authenticated users can view all witnesses
DROP POLICY IF EXISTS "Authenticated users can view all lesson_witnesses" ON public.lesson_witnesses;
CREATE POLICY "Authenticated users can view all lesson_witnesses"
  ON public.lesson_witnesses
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert witnesses
DROP POLICY IF EXISTS "Admins can insert lesson_witnesses" ON public.lesson_witnesses;
CREATE POLICY "Admins can insert lesson_witnesses"
  ON public.lesson_witnesses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update witnesses
DROP POLICY IF EXISTS "Admins can update lesson_witnesses" ON public.lesson_witnesses;
CREATE POLICY "Admins can update lesson_witnesses"
  ON public.lesson_witnesses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete witnesses
DROP POLICY IF EXISTS "Admins can delete lesson_witnesses" ON public.lesson_witnesses;
CREATE POLICY "Admins can delete lesson_witnesses"
  ON public.lesson_witnesses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for lesson_witnesses
CREATE INDEX IF NOT EXISTS idx_lesson_witnesses_lesson_id ON public.lesson_witnesses(lesson_id);
-- Composite index matching the ORDER BY used when listing a lesson's witnesses
CREATE INDEX IF NOT EXISTS idx_lesson_witnesses_lesson_sort ON public.lesson_witnesses(lesson_id, sort_order, created_at);

-- Create trigger for updated_at on lesson_witnesses
DROP TRIGGER IF EXISTS set_lesson_witnesses_updated_at ON public.lesson_witnesses;
CREATE TRIGGER set_lesson_witnesses_updated_at
  BEFORE UPDATE ON public.lesson_witnesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
-- Public can only SELECT (RLS policies filter to published lessons)
GRANT SELECT ON public.lesson_witnesses TO public;
-- Authenticated users can attempt all operations; RLS restricts writes to admins
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_witnesses TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.lesson_witnesses IS 'Witnesses (pamětníci) featured in a lesson story, shown as cards with a detail modal on the lesson detail page';
COMMENT ON COLUMN public.lesson_witnesses.role_short IS 'Short role shown on the card, e.g. "Poslankyně"';
COMMENT ON COLUMN public.lesson_witnesses.role_full IS 'Full role shown in the detail modal, e.g. "Poslankyně Parlamentu (1997-2013) a ministryně spravedlnosti (1997-1998)"';
COMMENT ON COLUMN public.lesson_witnesses.birth_year IS 'Year of birth, rendered as "*1953" in the detail modal';
COMMENT ON COLUMN public.lesson_witnesses.bio IS 'Short biography (~900 characters) shown in the detail modal';
COMMENT ON COLUMN public.lesson_witnesses.memory_of_nations_url IS 'Link to the witness profile on pametnaroda.cz';
COMMENT ON COLUMN public.lesson_witnesses.sort_order IS 'Display order within the lesson; lower values first, ties broken by created_at';

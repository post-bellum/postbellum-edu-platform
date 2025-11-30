-- Add published field to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false NOT NULL;

-- Create index for published filtering
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(published);
CREATE INDEX IF NOT EXISTS idx_lessons_published_date ON public.lessons(published, publication_date);

-- Add comment
COMMENT ON COLUMN public.lessons.published IS 'Whether the lesson is published and visible to public';

-- Drop existing public SELECT policy
DROP POLICY IF EXISTS "Lessons are viewable by everyone" ON public.lessons;

-- New policy: Public can only view published lessons
CREATE POLICY "Public can view published lessons"
  ON public.lessons
  FOR SELECT
  TO public
  USING (published = true);

-- Policy: Authenticated users can view all lessons (for admins to see drafts)
CREATE POLICY "Authenticated users can view all lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- Create user_favorites junction table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for user_favorites
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_lesson_id ON public.user_favorites(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON public.user_favorites(created_at);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.user_favorites TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.user_favorites IS 'User favorite lessons - many-to-many relationship between users and lessons';
COMMENT ON COLUMN public.user_favorites.user_id IS 'User who favorited the lesson';
COMMENT ON COLUMN public.user_favorites.lesson_id IS 'Lesson that was favorited';


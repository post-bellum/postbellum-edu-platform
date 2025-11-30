-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for admin checks
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Add comment
COMMENT ON COLUMN public.profiles.is_admin IS 'Admin flag for users who can create and edit lessons';

-- Create tags table (reusable tags)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view tags
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can insert tags
CREATE POLICY "Admins can insert tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update tags
CREATE POLICY "Admins can update tags"
  ON public.tags
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

-- Policy: Only admins can delete tags
CREATE POLICY "Admins can delete tags"
  ON public.tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_title ON public.tags(title);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON public.tags(created_at);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vimeo_video_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  rvp_connection TEXT[] DEFAULT '{}',
  period TEXT,
  target_group TEXT,
  lesson_type TEXT,
  publication_date DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON public.lessons
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can insert lessons
CREATE POLICY "Admins can insert lessons"
  ON public.lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update lessons
CREATE POLICY "Admins can update lessons"
  ON public.lessons
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

-- Policy: Only admins can delete lessons
CREATE POLICY "Admins can delete lessons"
  ON public.lessons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for lessons
CREATE INDEX IF NOT EXISTS idx_lessons_created_by ON public.lessons(created_by);
CREATE INDEX IF NOT EXISTS idx_lessons_publication_date ON public.lessons(publication_date);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON public.lessons(created_at);
CREATE INDEX IF NOT EXISTS idx_lessons_period ON public.lessons(period);
CREATE INDEX IF NOT EXISTS idx_lessons_target_group ON public.lessons(target_group);

-- Create trigger for updated_at on lessons
CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create lesson_tags junction table
CREATE TABLE IF NOT EXISTS public.lesson_tags (
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view lesson tags
CREATE POLICY "Lesson tags are viewable by everyone"
  ON public.lesson_tags
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can insert lesson tags
CREATE POLICY "Admins can insert lesson tags"
  ON public.lesson_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete lesson tags
CREATE POLICY "Admins can delete lesson tags"
  ON public.lesson_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for lesson_tags
CREATE INDEX IF NOT EXISTS idx_lesson_tags_lesson_id ON public.lesson_tags(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_tags_tag_id ON public.lesson_tags(tag_id);

-- Create lesson_materials table
CREATE TABLE IF NOT EXISTS public.lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  specification TEXT CHECK (specification IN ('1st_grade_elementary', '2nd_grade_elementary', 'high_school')),
  duration INTEGER CHECK (duration IN (30, 45, 90)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view lesson materials
CREATE POLICY "Lesson materials are viewable by everyone"
  ON public.lesson_materials
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can insert lesson materials
CREATE POLICY "Admins can insert lesson materials"
  ON public.lesson_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update lesson materials
CREATE POLICY "Admins can update lesson materials"
  ON public.lesson_materials
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

-- Policy: Only admins can delete lesson materials
CREATE POLICY "Admins can delete lesson materials"
  ON public.lesson_materials
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for lesson_materials
CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON public.lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_specification ON public.lesson_materials(specification);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_duration ON public.lesson_materials(duration);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_spec_duration ON public.lesson_materials(specification, duration);

-- Create trigger for updated_at on lesson_materials
CREATE TRIGGER set_lesson_materials_updated_at
  BEFORE UPDATE ON public.lesson_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create additional_activities table
CREATE TABLE IF NOT EXISTS public.additional_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.additional_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view additional activities
CREATE POLICY "Additional activities are viewable by everyone"
  ON public.additional_activities
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only admins can insert additional activities
CREATE POLICY "Admins can insert additional activities"
  ON public.additional_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update additional activities
CREATE POLICY "Admins can update additional activities"
  ON public.additional_activities
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

-- Policy: Only admins can delete additional activities
CREATE POLICY "Admins can delete additional activities"
  ON public.additional_activities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for additional_activities
CREATE INDEX IF NOT EXISTS idx_additional_activities_lesson_id ON public.additional_activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_additional_activities_created_at ON public.additional_activities(created_at);

-- Create trigger for updated_at on additional_activities
CREATE TRIGGER set_additional_activities_updated_at
  BEFORE UPDATE ON public.additional_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
-- Public can only SELECT (RLS policies will filter to published content)
GRANT SELECT ON public.tags TO public;
GRANT SELECT ON public.lessons TO public;
GRANT SELECT ON public.lesson_tags TO public;
GRANT SELECT ON public.lesson_materials TO public;
GRANT SELECT ON public.additional_activities TO public;

-- Authenticated users can SELECT all (RLS will filter based on published status)
-- INSERT/UPDATE/DELETE permissions are granted but RLS policies restrict to admins only
-- Note: GRANT defines what operations can be attempted; RLS policies filter which rows can be accessed
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.lesson_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.additional_activities TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.tags IS 'Reusable tags for categorizing lessons';
COMMENT ON TABLE public.lessons IS 'Main lessons table containing lesson metadata';
COMMENT ON TABLE public.lesson_tags IS 'Junction table for many-to-many relationship between lessons and tags';
COMMENT ON TABLE public.lesson_materials IS 'Lesson materials (worksheets, methodological sheets) filtered by specification and duration';
COMMENT ON TABLE public.additional_activities IS 'Supplementary activities for lessons (e.g., Kahoot quizzes)';

COMMENT ON COLUMN public.lessons.rvp_connection IS 'Array of RVP (Framework Education Program) connections';
COMMENT ON COLUMN public.lesson_materials.specification IS 'Target group: 1st_grade_elementary, 2nd_grade_elementary, or high_school';
COMMENT ON COLUMN public.lesson_materials.duration IS 'Duration in minutes: 30, 45, or 90';


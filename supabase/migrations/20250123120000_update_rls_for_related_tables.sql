-- Update RLS policies for related tables to only allow public access to published lessons
-- This ensures that lesson_tags, lesson_materials, and additional_activities are only
-- visible to public users when the associated lesson is published

-- Drop existing public policies on related tables
DROP POLICY IF EXISTS "Lesson tags are viewable by everyone" ON public.lesson_tags;
DROP POLICY IF EXISTS "Lesson materials are viewable by everyone" ON public.lesson_materials;
DROP POLICY IF EXISTS "Additional activities are viewable by everyone" ON public.additional_activities;

-- New policy: Public can only view lesson_tags for published lessons
CREATE POLICY "Public can view lesson_tags for published lessons"
  ON public.lesson_tags
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_tags.lesson_id
      AND lessons.published = true
    )
  );

-- Policy: Authenticated users can view all lesson_tags
CREATE POLICY "Authenticated users can view all lesson_tags"
  ON public.lesson_tags
  FOR SELECT
  TO authenticated
  USING (true);

-- New policy: Public can only view lesson_materials for published lessons
CREATE POLICY "Public can view lesson_materials for published lessons"
  ON public.lesson_materials
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_materials.lesson_id
      AND lessons.published = true
    )
  );

-- Policy: Authenticated users can view all lesson_materials
CREATE POLICY "Authenticated users can view all lesson_materials"
  ON public.lesson_materials
  FOR SELECT
  TO authenticated
  USING (true);

-- New policy: Public can only view additional_activities for published lessons
CREATE POLICY "Public can view additional_activities for published lessons"
  ON public.additional_activities
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = additional_activities.lesson_id
      AND lessons.published = true
    )
  );

-- Policy: Authenticated users can view all additional_activities
CREATE POLICY "Authenticated users can view all additional_activities"
  ON public.additional_activities
  FOR SELECT
  TO authenticated
  USING (true);


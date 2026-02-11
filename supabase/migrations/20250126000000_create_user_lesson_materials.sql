-- Create user_lesson_materials table for user copies of lesson materials
-- This allows users to create their own customized versions of lesson materials

SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS public.user_lesson_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source_material_id UUID REFERENCES public.lesson_materials(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_lesson_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own materials
CREATE POLICY "Users can view their own lesson materials"
  ON public.user_lesson_materials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can create their own materials
CREATE POLICY "Users can create their own lesson materials"
  ON public.user_lesson_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own materials
CREATE POLICY "Users can update their own lesson materials"
  ON public.user_lesson_materials
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own materials
CREATE POLICY "Users can delete their own lesson materials"
  ON public.user_lesson_materials
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_lesson_materials_user_id ON public.user_lesson_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_materials_lesson_id ON public.user_lesson_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_materials_source_id ON public.user_lesson_materials(source_material_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_materials_user_lesson ON public.user_lesson_materials(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_materials_created_at ON public.user_lesson_materials(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER set_user_lesson_materials_updated_at
  BEFORE UPDATE ON public.user_lesson_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lesson_materials TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.user_lesson_materials IS 'User-created copies of lesson materials that can be customized';
COMMENT ON COLUMN public.user_lesson_materials.source_material_id IS 'Reference to the original lesson material this was copied from';
COMMENT ON COLUMN public.user_lesson_materials.lesson_id IS 'Reference to the lesson (denormalized for easier querying)';

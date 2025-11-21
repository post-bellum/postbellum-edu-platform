-- Create profiles table for user registration data
-- Single source of truth for all user profile information

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('teacher', 'not-teacher')),
  
  -- For teachers: actual school name
  school_name TEXT,
  
  -- For non-teachers: category selection
  category TEXT CHECK (category IN ('student', 'parent', 'educational_professional', 'ngo_worker', 'public_sector_worker', 'other')),
  
  email_consent BOOLEAN DEFAULT false,
  registration_completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure data integrity: teachers must have school_name, non-teachers must have category
  CONSTRAINT check_teacher_data CHECK (
    (user_type = 'teacher' AND school_name IS NOT NULL AND category IS NULL) OR
    (user_type = 'not-teacher' AND category IS NOT NULL AND school_name IS NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_category ON public.profiles(category);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email_consent ON public.profiles(email_consent);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profile data collected during registration. Single source of truth for all user information.';
COMMENT ON COLUMN public.profiles.school_name IS 'School name for teachers only (NULL for non-teachers)';
COMMENT ON COLUMN public.profiles.category IS 'Category for non-teachers only: student, parent, educational_professional, ngo_worker, public_sector_worker, or other (NULL for teachers)';


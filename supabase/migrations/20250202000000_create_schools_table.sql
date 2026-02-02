-- Create schools table for Czech school registry data
-- Stores simplified school information: fullname and address only

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing schools table if it exists (with old structure)
-- This is safe because we're creating a new table structure
-- If you need to preserve old data, modify this migration first!
DROP TABLE IF EXISTS public.schools CASCADE;

CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  red_izo TEXT UNIQUE NOT NULL, -- RED IZO identifier from registry
  fullname TEXT NOT NULL,
  -- Address fields
  ulice TEXT, -- Street name
  cislo_domovni INTEGER, -- House number
  typ_cisla_domovniho TEXT, -- Type of house number (č.p., etc.)
  cislo_orientacni INTEGER, -- Orientation number
  obec TEXT, -- City/Municipality
  cast_obce TEXT, -- Part of city
  psc TEXT, -- Postal code
  kod_ruian BIGINT, -- RÚIAN code
  okres TEXT, -- District
  uzemi_dle_orp TEXT, -- Territory according to ORP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read schools (for autocomplete)
DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
CREATE POLICY "Schools are viewable by everyone" 
  ON public.schools 
  FOR SELECT 
  TO public
  USING (true);

-- Policy: Only admins can insert schools
DROP POLICY IF EXISTS "Admins can insert schools" ON public.schools;
CREATE POLICY "Admins can insert schools" 
  ON public.schools 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update schools
DROP POLICY IF EXISTS "Admins can update schools" ON public.schools;
CREATE POLICY "Admins can update schools" 
  ON public.schools 
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

-- Policy: Only admins can delete schools
DROP POLICY IF EXISTS "Admins can delete schools" ON public.schools;
CREATE POLICY "Admins can delete schools" 
  ON public.schools 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_schools_red_izo ON public.schools(red_izo);
-- Full-text search index using 'simple' configuration (always available, works for Czech text)
CREATE INDEX IF NOT EXISTS idx_schools_fullname ON public.schools USING gin(to_tsvector('simple', fullname));
-- Case-insensitive index for better ILIKE queries (works well for Czech autocomplete)
CREATE INDEX IF NOT EXISTS idx_schools_fullname_lower ON public.schools(lower(fullname));
CREATE INDEX IF NOT EXISTS idx_schools_obec ON public.schools(obec);
CREATE INDEX IF NOT EXISTS idx_schools_ulice ON public.schools(ulice);
CREATE INDEX IF NOT EXISTS idx_schools_psc ON public.schools(psc);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_schools_updated_at ON public.schools;
CREATE TRIGGER set_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT SELECT ON public.schools TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.schools IS 'Czech school registry data. Contains fullname and address fields for autocomplete functionality.';
COMMENT ON COLUMN public.schools.red_izo IS 'RED IZO identifier from Czech Ministry of Education registry';
COMMENT ON COLUMN public.schools.fullname IS 'Full official name of the school';
COMMENT ON COLUMN public.schools.ulice IS 'Street name';
COMMENT ON COLUMN public.schools.cislo_domovni IS 'House number';
COMMENT ON COLUMN public.schools.obec IS 'City/Municipality';
COMMENT ON COLUMN public.schools.psc IS 'Postal code';

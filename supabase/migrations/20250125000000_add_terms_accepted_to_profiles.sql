-- Add terms_accepted field to profiles table
-- This field tracks whether the user has accepted the terms of service during registration

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.terms_accepted IS 'Indicates whether the user has accepted the terms of service during registration';


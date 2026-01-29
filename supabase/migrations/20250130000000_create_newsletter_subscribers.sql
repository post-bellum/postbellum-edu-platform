-- Create newsletter_subscribers table for storing newsletter subscriptions
-- This table stores email addresses of users who want to receive updates

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Ensure email is not empty
  CONSTRAINT email_not_empty CHECK (length(trim(email)) > 0)
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (subscribe) - no authentication required
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Policy: Only service role can view subscribers (for admin purposes)
CREATE POLICY "Service role can view subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON public.newsletter_subscribers(is_active);

-- Grant permissions
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter subscribers - stores email addresses of users who want to receive updates about new lessons.';
COMMENT ON COLUMN public.newsletter_subscribers.is_active IS 'Whether the subscription is currently active. Set to false when user unsubscribes.';

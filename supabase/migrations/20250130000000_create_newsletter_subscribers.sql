-- Create newsletter_subscribers table for storing newsletter subscriptions
-- This table stores email addresses of users who want to receive updates

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
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

-- Policy: Allow anyone to update via unsubscribe token (for unsubscribing)
CREATE POLICY "Anyone can unsubscribe via token" 
  ON public.newsletter_subscribers 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anyone to select by unsubscribe token (for unsubscribe page)
CREATE POLICY "Anyone can lookup by unsubscribe token" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON public.newsletter_subscribers(unsubscribe_token);

-- Grant permissions
GRANT INSERT, SELECT, UPDATE ON public.newsletter_subscribers TO anon;
GRANT INSERT, SELECT, UPDATE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter subscribers - stores email addresses of users who want to receive updates about new lessons.';
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribe_token IS 'Unique token used to generate unsubscribe URLs. Included in newsletter emails.';
COMMENT ON COLUMN public.newsletter_subscribers.is_active IS 'Whether the subscription is currently active. Set to false when user unsubscribes.';

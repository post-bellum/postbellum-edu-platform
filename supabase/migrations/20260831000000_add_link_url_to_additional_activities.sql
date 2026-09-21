-- Add link_url to additional_activities
-- Lets admins attach a clickable external link (e.g. Kahoot!, Google Form) to an
-- additional activity, in addition to (or instead of) an image/QR code or PDF.
ALTER TABLE public.additional_activities
  ADD COLUMN IF NOT EXISTS link_url TEXT;

COMMENT ON COLUMN public.additional_activities.link_url IS 'Optional external http(s) link opened by the "Otevřít odkaz" button on the lesson detail.';

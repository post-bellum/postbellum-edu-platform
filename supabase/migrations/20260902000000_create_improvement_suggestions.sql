-- Improvement suggestions sent from the "Poslat návrh na zlepšení" dialog on the
-- lesson detail page. The suggestion is emailed to the admin inbox, but it is
-- stored here first so a failure of the email provider never loses it.
--
-- Rows are written exclusively by the server action using the service role.
-- There is deliberately no INSERT policy for anon/authenticated.

CREATE TABLE IF NOT EXISTS public.improvement_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Author. Kept as a snapshot too, so a deleted account still leaves a
  -- readable suggestion behind.
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT,

  -- Lesson the suggestion was sent from. Snapshotted for the same reason:
  -- the record should still match the email that was sent.
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  lesson_title TEXT,

  message TEXT NOT NULL,

  -- Delivery bookkeeping. email_sent_at IS NULL means the email never went out
  -- (missing configuration or a provider error) and the suggestion needs to be
  -- picked up manually; email_error then says why.
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT message_length CHECK (length(message) BETWEEN 10 AND 2000)
);

-- Newest first, for reading the suggestions
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_created_at
  ON public.improvement_suggestions(created_at DESC);

-- Supports the per-user submission throttle in the server action
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_user_created_at
  ON public.improvement_suggestions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_lesson_id
  ON public.improvement_suggestions(lesson_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.improvement_suggestions ENABLE ROW LEVEL SECURITY;

-- Only admins may read the suggestions. Writing is service-role only, so no
-- INSERT/UPDATE/DELETE policy is granted to any client role.
DROP POLICY IF EXISTS "Admins can view improvement suggestions" ON public.improvement_suggestions;
CREATE POLICY "Admins can view improvement suggestions"
  ON public.improvement_suggestions
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.improvement_suggestions TO authenticated;
GRANT ALL ON public.improvement_suggestions TO service_role;

COMMENT ON TABLE public.improvement_suggestions IS 'Improvement suggestions submitted from the lesson detail dialog. Emailed to the admin inbox and kept here as the durable record.';
COMMENT ON COLUMN public.improvement_suggestions.email_sent_at IS 'When the notification email was accepted by the provider. NULL = not delivered, see email_error.';
COMMENT ON COLUMN public.improvement_suggestions.email_error IS 'Why the notification email could not be sent (missing config or provider error).';

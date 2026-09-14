-- SmartEmailing synchronization state for newsletter subscribers.
--
-- Supabase remains the source of truth. Every subscribe/unsubscribe is pushed
-- to the SmartEmailing contact list right away; if that push fails the row
-- stays flagged as pending and an hourly cron retries it.

ALTER TABLE public.newsletter_subscribers
  -- true = the row still has to be pushed to SmartEmailing. New rows default
  -- to true so a subscriber is never silently missing from the mailing list.
  ADD COLUMN IF NOT EXISTS se_pending BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS se_synced_at TIMESTAMPTZ,
  -- Last error message from the API, shown in the admin UI. NULL when fine.
  ADD COLUMN IF NOT EXISTS se_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN public.newsletter_subscribers.se_pending IS 'Row has not been pushed to SmartEmailing yet (or the last push failed).';
COMMENT ON COLUMN public.newsletter_subscribers.se_synced_at IS 'When this row was last successfully written to the SmartEmailing contact list.';
COMMENT ON COLUMN public.newsletter_subscribers.se_sync_error IS 'Error message from the last failed SmartEmailing sync, NULL when the last sync succeeded.';

-- Partial index so the sync job scans only the queue, not the whole table.
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_se_pending
  ON public.newsletter_subscribers (subscribed_at)
  WHERE se_pending;

-- ---------------------------------------------------------------------------
-- RLS hardening
--
-- The remaining SELECT policy was `USING (true)`, so anon could read every
-- subscriber e-mail together with its unsubscribe token. Nothing in the app
-- needs that: subscribe, unsubscribe, the profile toggle and the admin list
-- all go through server actions using the service role client, which bypasses
-- RLS. (The INSERT/UPDATE grants were already revoked in
-- 20250131000000_fix_newsletter_rls_policy.sql.)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can lookup by unsubscribe token" ON public.newsletter_subscribers;

REVOKE SELECT ON public.newsletter_subscribers FROM anon;
REVOKE SELECT ON public.newsletter_subscribers FROM authenticated;

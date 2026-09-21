-- Mirror of the SmartEmailing-side contact state, so the admin list shows why
-- an address is not reachable without opening SmartEmailing.
--
-- These columns are read-only for us: the reconciliation job fills them from
-- the contact list, we never push them back (blacklisting and bounce handling
-- stay SmartEmailing's decision).

ALTER TABLE public.newsletter_subscribers
  -- Account-wide blacklist: the contact receives no marketing e-mail at all,
  -- regardless of its status in any list.
  ADD COLUMN IF NOT EXISTS se_blacklisted BOOLEAN NOT NULL DEFAULT false,
  -- Permanent delivery failure (5.x.x), typically a non-existent mailbox or
  -- domain. SmartEmailing stops sending to the address.
  ADD COLUMN IF NOT EXISTS se_hardbounced BOOLEAN NOT NULL DEFAULT false,
  -- Membership status in our contact list: confirmed / unsubscribed / removed.
  -- NULL means the contact is not in the list (or was never synced).
  ADD COLUMN IF NOT EXISTS se_list_status TEXT,
  -- When the three columns above were last refreshed from the API.
  ADD COLUMN IF NOT EXISTS se_state_checked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.newsletter_subscribers.se_blacklisted IS 'Contact is blacklisted account-wide in SmartEmailing (no marketing e-mail is delivered).';
COMMENT ON COLUMN public.newsletter_subscribers.se_hardbounced IS 'Permanent delivery failure reported by the recipient server - the address most likely does not exist.';
COMMENT ON COLUMN public.newsletter_subscribers.se_list_status IS 'Membership status in the SmartEmailing contact list: confirmed, unsubscribed, removed, or NULL when not present.';
COMMENT ON COLUMN public.newsletter_subscribers.se_state_checked_at IS 'When the SmartEmailing-side state was last read by the reconciliation job.';

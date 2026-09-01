-- Let users skip a question.
--
-- The questions are optional, so a user has to be able to move past one
-- without answering. A skip is stored as an answer row with no value and
-- skipped = true, which keeps two things apart that would otherwise look the
-- same: "did not want to answer" and "has not been asked yet". The widget
-- treats both answered and skipped questions as dealt with, so it stops
-- showing once the user has been through the questionnaire.

ALTER TABLE public.profile_answers
  ADD COLUMN IF NOT EXISTS skipped BOOLEAN NOT NULL DEFAULT false;

-- A row now carries either an answer or a skip
ALTER TABLE public.profile_answers
  DROP CONSTRAINT IF EXISTS answer_not_empty;
ALTER TABLE public.profile_answers
  ADD CONSTRAINT answer_not_empty CHECK (
    option_id IS NOT NULL
    OR answer_text IS NOT NULL
    OR scale_value IS NOT NULL
    OR skipped
  );

-- A skip never carries a value at the same time
ALTER TABLE public.profile_answers
  DROP CONSTRAINT IF EXISTS skipped_has_no_value;
ALTER TABLE public.profile_answers
  ADD CONSTRAINT skipped_has_no_value CHECK (
    NOT skipped
    OR (option_id IS NULL AND answer_text IS NULL AND scale_value IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_profile_answers_skipped ON public.profile_answers(skipped);

COMMENT ON COLUMN public.profile_answers.skipped IS 'User moved past the question without answering; no row at all means the question was never shown to them';

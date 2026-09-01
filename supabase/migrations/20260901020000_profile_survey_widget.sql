-- Floating profile survey widget:
--   * two more answer types: emoji_scale (5 point) and textarea (long free text)
--   * per-questionnaire settings (active flag, launcher label) editable in admin

-- ---------------------------------------------------------------------------
-- New answer types
-- ---------------------------------------------------------------------------
ALTER TABLE public.profile_questions
  DROP CONSTRAINT IF EXISTS profile_questions_answer_type_check;
ALTER TABLE public.profile_questions
  ADD CONSTRAINT profile_questions_answer_type_check
  CHECK (answer_type IN ('text', 'textarea', 'select', 'emoji_scale'));

-- End labels of the emoji scale ("Skvěle" ... "Spíš špatně")
ALTER TABLE public.profile_questions
  ADD COLUMN IF NOT EXISTS scale_min_label TEXT,
  ADD COLUMN IF NOT EXISTS scale_max_label TEXT;

ALTER TABLE public.profile_questions
  DROP CONSTRAINT IF EXISTS scale_label_length;
ALTER TABLE public.profile_questions
  ADD CONSTRAINT scale_label_length CHECK (
    (scale_min_label IS NULL OR length(scale_min_label) <= 60) AND
    (scale_max_label IS NULL OR length(scale_max_label) <= 60)
  );

-- ---------------------------------------------------------------------------
-- Emoji scale answers (1 = leftmost/best ... 5 = rightmost)
-- ---------------------------------------------------------------------------
ALTER TABLE public.profile_answers
  ADD COLUMN IF NOT EXISTS scale_value SMALLINT;

ALTER TABLE public.profile_answers
  DROP CONSTRAINT IF EXISTS scale_value_range;
ALTER TABLE public.profile_answers
  ADD CONSTRAINT scale_value_range CHECK (scale_value IS NULL OR scale_value BETWEEN 1 AND 5);

ALTER TABLE public.profile_answers
  DROP CONSTRAINT IF EXISTS answer_not_empty;
ALTER TABLE public.profile_answers
  ADD CONSTRAINT answer_not_empty CHECK (
    option_id IS NOT NULL OR answer_text IS NOT NULL OR scale_value IS NOT NULL
  );

-- ---------------------------------------------------------------------------
-- Widget settings - a single row managed in the administration
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_survey_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT false,
  launcher_label TEXT NOT NULL DEFAULT 'Jak se vám tu líbí?',
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT profile_survey_settings_single_row CHECK (id),
  CONSTRAINT launcher_label_length CHECK (length(launcher_label) BETWEEN 1 AND 60)
);

DROP TRIGGER IF EXISTS set_updated_at ON public.profile_survey_settings;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profile_survey_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profile_survey_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view survey settings" ON public.profile_survey_settings;
CREATE POLICY "Authenticated users can view survey settings"
  ON public.profile_survey_settings
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage survey settings" ON public.profile_survey_settings;
CREATE POLICY "Admins can manage survey settings"
  ON public.profile_survey_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

GRANT SELECT ON public.profile_survey_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profile_survey_settings TO service_role;

-- The questionnaire starts switched off so it never appears before an admin
-- has reviewed the questions
INSERT INTO public.profile_survey_settings (id, is_active)
VALUES (true, false)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.profile_survey_settings IS 'Single-row settings of the floating profile survey widget';
COMMENT ON COLUMN public.profile_questions.scale_min_label IS 'Label under the leftmost emoji of an emoji_scale question';
COMMENT ON COLUMN public.profile_questions.scale_max_label IS 'Label under the rightmost emoji of an emoji_scale question';
COMMENT ON COLUMN public.profile_answers.scale_value IS 'Answer to an emoji_scale question, 1 (leftmost) to 5 (rightmost)';

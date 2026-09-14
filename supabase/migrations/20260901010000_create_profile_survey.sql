-- Profile survey: optional questions shown in user profile settings,
-- fully managed from the administration (text, options, order, visibility).
--
-- profile_questions        - the questions themselves
-- profile_question_options - choices for questions of type 'select'
-- profile_answers          - one answer per user per question
--
-- Answering is always optional: a missing profile_answers row means unanswered.

-- Defensive: an earlier iteration stored the answers as columns on profiles
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS teaching_experience,
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS referral_source;

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  help_text TEXT,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('text', 'select')),
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT question_text_length CHECK (length(question_text) BETWEEN 1 AND 200),
  CONSTRAINT help_text_length CHECK (help_text IS NULL OR length(help_text) <= 300)
);

CREATE INDEX IF NOT EXISTS idx_profile_questions_position ON public.profile_questions(position);
CREATE INDEX IF NOT EXISTS idx_profile_questions_is_active ON public.profile_questions(is_active);

-- ---------------------------------------------------------------------------
-- Options for 'select' questions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT option_label_length CHECK (length(label) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS idx_profile_question_options_question_id
  ON public.profile_question_options(question_id, position);

-- ---------------------------------------------------------------------------
-- Answers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  -- Selected option for 'select' questions. Renaming an option in the
  -- administration keeps existing answers attached to it; deleting an option
  -- removes the answers that pointed at it (they no longer mean anything).
  option_id UUID REFERENCES public.profile_question_options(id) ON DELETE CASCADE,
  -- Free text answer for 'text' questions
  answer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT profile_answers_unique_per_question UNIQUE (user_id, question_id),
  CONSTRAINT answer_text_length CHECK (answer_text IS NULL OR length(answer_text) <= 500),
  -- An answer row always carries an actual answer; clearing it deletes the row
  CONSTRAINT answer_not_empty CHECK (option_id IS NOT NULL OR answer_text IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_profile_answers_user_id ON public.profile_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_answers_question_id ON public.profile_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_profile_answers_option_id ON public.profile_answers(option_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (handle_updated_at is created in the profiles migration)
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_updated_at ON public.profile_questions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profile_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profile_answers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profile_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_answers ENABLE ROW LEVEL SECURITY;

-- Questions and options are readable by any signed-in user (rendered in profile)
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.profile_questions;
CREATE POLICY "Authenticated users can view questions"
  ON public.profile_questions
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view question options" ON public.profile_question_options;
CREATE POLICY "Authenticated users can view question options"
  ON public.profile_question_options
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins may change the questions (admin server actions use the service
-- role, these policies protect the tables against direct client access)
DROP POLICY IF EXISTS "Admins can manage questions" ON public.profile_questions;
CREATE POLICY "Admins can manage questions"
  ON public.profile_questions
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS "Admins can manage question options" ON public.profile_question_options;
CREATE POLICY "Admins can manage question options"
  ON public.profile_question_options
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- Users fully manage their own answers
DROP POLICY IF EXISTS "Users can view own answers" ON public.profile_answers;
CREATE POLICY "Users can view own answers"
  ON public.profile_answers
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own answers" ON public.profile_answers;
CREATE POLICY "Users can insert own answers"
  ON public.profile_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own answers" ON public.profile_answers;
CREATE POLICY "Users can update own answers"
  ON public.profile_answers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own answers" ON public.profile_answers;
CREATE POLICY "Users can delete own answers"
  ON public.profile_answers
  FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT SELECT ON public.profile_questions TO authenticated;
GRANT SELECT ON public.profile_question_options TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_questions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_question_options TO service_role;
GRANT SELECT ON public.profile_answers TO service_role;

-- ---------------------------------------------------------------------------
-- Seed the three initial questions
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  experience_id UUID;
  referral_id UUID;
BEGIN
  -- Only seed an empty table so re-running never duplicates questions
  IF EXISTS (SELECT 1 FROM public.profile_questions) THEN
    RETURN;
  END IF;

  INSERT INTO public.profile_questions (question_text, answer_type, position)
  VALUES ('Délka praxe', 'select', 0)
  RETURNING id INTO experience_id;

  INSERT INTO public.profile_question_options (question_id, label, position)
  VALUES
    (experience_id, 'Méně než 1 rok', 0),
    (experience_id, '1–5 let', 1),
    (experience_id, '6–10 let', 2),
    (experience_id, '11–20 let', 3),
    (experience_id, 'Více než 20 let', 4);

  INSERT INTO public.profile_questions (question_text, help_text, answer_type, position)
  VALUES ('Předmět', 'Např. dějepis, občanská výchova', 'text', 1);

  INSERT INTO public.profile_questions (question_text, answer_type, position)
  VALUES ('Jak jste se o storyON dozvěděli?', 'select', 2)
  RETURNING id INTO referral_id;

  INSERT INTO public.profile_question_options (question_id, label, position)
  VALUES
    (referral_id, 'Od kolegy/kolegyně nebo známého', 0),
    (referral_id, 'Ze sociálních sítí', 1),
    (referral_id, 'Z internetového vyhledávání', 2),
    (referral_id, 'Z newsletteru', 3),
    (referral_id, 'Ze školení, semináře nebo konference', 4),
    (referral_id, 'Z médií (tisk, rádio, televize)', 5),
    (referral_id, 'Ze školy nebo od vedení školy', 6),
    (referral_id, 'Jinak', 7);
END $$;

COMMENT ON TABLE public.profile_questions IS 'Optional profile survey questions, managed in the administration';
COMMENT ON TABLE public.profile_question_options IS 'Choices for profile survey questions of type select';
COMMENT ON TABLE public.profile_answers IS 'User answers to the profile survey. No row = unanswered.';

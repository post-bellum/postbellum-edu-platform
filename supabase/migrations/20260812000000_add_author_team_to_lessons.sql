-- Add author_team ("Autorský tým výukového setu") to lessons
-- Free-form text listing the authors behind the lesson set, shown in the
-- lesson detail info panel alongside the other basic information.

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS author_team TEXT;

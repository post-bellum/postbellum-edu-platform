-- Add sort_order to lessons so admins can set the catalog order manually.
-- Lower values come first. Existing lessons are backfilled with the order the
-- catalog used until now (newest publication date first), so nothing visibly
-- moves on deploy. New lessons are placed at the top by the application.

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY publication_date DESC NULLS LAST, created_at DESC
    ) - 1 AS position
  FROM public.lessons
)
UPDATE public.lessons AS l
SET sort_order = ranked.position
FROM ranked
WHERE l.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON public.lessons (sort_order);

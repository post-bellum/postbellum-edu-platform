-- Split lesson material content into two independent sources:
--   * pdf_url        - PDF uploaded by an admin, served by the "Stáhnout" button
--   * content        - rich text edited in the editor, served by "Upravit" (unchanged)
-- Both are optional and may diverge on purpose (print-ready PDF vs. editable text).
ALTER TABLE public.lesson_materials
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS pdf_file_name TEXT;

COMMENT ON COLUMN public.lesson_materials.pdf_url IS 'Public URL of the admin-uploaded PDF used by the download button. NULL = fall back to generating a PDF from content.';
COMMENT ON COLUMN public.lesson_materials.pdf_file_name IS 'Original file name of the uploaded PDF, used as the download file name.';

-- Print-ready material PDFs are routinely larger than the 5MB image limit.
UPDATE storage.buckets
SET file_size_limit = 20971520 -- 20MB
WHERE id = 'lesson-materials';

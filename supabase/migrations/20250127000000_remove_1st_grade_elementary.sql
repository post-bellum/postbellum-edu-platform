-- Remove 1st_grade_elementary from lesson_materials specification options
-- Keep only 2nd_grade_elementary and high_school

-- Update any existing materials with 1st_grade_elementary to 2nd_grade_elementary
UPDATE public.lesson_materials 
SET specification = '2nd_grade_elementary' 
WHERE specification = '1st_grade_elementary';

-- Drop the existing constraint and create a new one with only two values
ALTER TABLE public.lesson_materials 
DROP CONSTRAINT IF EXISTS lesson_materials_specification_check;

ALTER TABLE public.lesson_materials 
ADD CONSTRAINT lesson_materials_specification_check 
CHECK (specification IN ('2nd_grade_elementary', 'high_school'));

-- Update comment to reflect the change
COMMENT ON COLUMN public.lesson_materials.specification IS 'Target group: 2nd_grade_elementary or high_school';

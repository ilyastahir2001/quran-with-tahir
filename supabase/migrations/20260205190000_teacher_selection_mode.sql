-- Add teacher_selection_mode to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS teacher_selection_mode text CHECK (teacher_selection_mode IN ('academy', 'self'));
-- Add comment for clarity
COMMENT ON COLUMN public.students.teacher_selection_mode IS 'Determines if the academy assigns a teacher or the student finds one themselves.';
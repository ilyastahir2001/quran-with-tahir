-- Create a public view for students (similar to teachers_public)
CREATE OR REPLACE VIEW public.students_public AS
SELECT 
  s.id,
  s.full_name,
  s.avatar_url,
  s.country,
  s.course_level,
  s.language_pref,
  s.current_surah,
  s.current_juzz,
  s.status,
  s.teacher_id
FROM public.students s
WHERE s.status = 'active' OR s.status IS NULL;

-- Grant access to authenticated users
GRANT SELECT ON public.students_public TO authenticated;

-- Create teacher_student_messages table for messaging between teachers and students
CREATE TABLE public.teacher_student_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('teacher', 'student')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_student_messages ENABLE ROW LEVEL SECURITY;

-- Teachers can view and send messages
CREATE POLICY "Teachers can view their messages"
ON public.teacher_student_messages
FOR SELECT
USING (teacher_id = get_teacher_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Teachers can send messages"
ON public.teacher_student_messages
FOR INSERT
WITH CHECK (teacher_id = get_teacher_id(auth.uid()) AND sender_type = 'teacher');

CREATE POLICY "Teachers can mark messages as read"
ON public.teacher_student_messages
FOR UPDATE
USING (teacher_id = get_teacher_id(auth.uid()));

-- Students can view and send messages
CREATE POLICY "Students can view their messages"
ON public.teacher_student_messages
FOR SELECT
USING (student_id = get_student_id(auth.uid()));

CREATE POLICY "Students can send messages"
ON public.teacher_student_messages
FOR INSERT
WITH CHECK (student_id = get_student_id(auth.uid()) AND sender_type = 'student');

CREATE POLICY "Students can mark messages as read"
ON public.teacher_student_messages
FOR UPDATE
USING (student_id = get_student_id(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_teacher_student_messages_teacher ON public.teacher_student_messages(teacher_id);
CREATE INDEX idx_teacher_student_messages_student ON public.teacher_student_messages(student_id);
CREATE INDEX idx_teacher_student_messages_created ON public.teacher_student_messages(created_at DESC);
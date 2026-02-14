-- Student Dashboard Database Schema

-- 1. Create connection_status enum
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');

-- 2. Create connection_requests table
CREATE TABLE public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(student_id, teacher_id)
);

-- 3. Create student_settings table
CREATE TABLE public.student_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
  timezone text DEFAULT 'UTC',
  notification_prefs jsonb DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  video_pref boolean DEFAULT true,
  low_bandwidth_mode boolean DEFAULT false,
  accessibility_mode text DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create reschedule_requests table
CREATE TABLE public.reschedule_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  preferred_times jsonb NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- 5. Create student_feedback table
CREATE TABLE public.student_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- 6. Create teachers_public view with security_invoker
CREATE VIEW public.teachers_public 
WITH (security_invoker = true)
AS
SELECT 
  t.id,
  p.full_name,
  p.avatar_url,
  t.specializations,
  t.bio,
  t.teaching_hours_per_week,
  t.status
FROM public.teachers t
JOIN public.profiles p ON t.user_id = p.user_id
WHERE t.status = 'active';

-- 7. Helper function to get student_id from user_id
CREATE OR REPLACE FUNCTION public.get_student_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.students WHERE user_id = _user_id LIMIT 1
$$;

-- 8. Enable RLS on new tables
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for connection_requests
CREATE POLICY "Students can view their connection requests"
ON public.connection_requests FOR SELECT
USING (
  student_id = get_student_id(auth.uid()) 
  OR teacher_id = get_teacher_id(auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Students can create connection requests"
ON public.connection_requests FOR INSERT
WITH CHECK (student_id = get_student_id(auth.uid()));

CREATE POLICY "Students can update their pending requests"
ON public.connection_requests FOR UPDATE
USING (
  (student_id = get_student_id(auth.uid()) AND status = 'pending')
  OR teacher_id = get_teacher_id(auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Students can delete their pending requests"
ON public.connection_requests FOR DELETE
USING (student_id = get_student_id(auth.uid()) AND status = 'pending');

-- 10. RLS Policies for student_settings
CREATE POLICY "Students can manage their settings"
ON public.student_settings FOR ALL
USING (student_id = get_student_id(auth.uid()));

-- 11. RLS Policies for reschedule_requests
CREATE POLICY "Students can view their reschedule requests"
ON public.reschedule_requests FOR SELECT
USING (
  student_id = get_student_id(auth.uid())
  OR is_admin(auth.uid())
);

CREATE POLICY "Students can create reschedule requests"
ON public.reschedule_requests FOR INSERT
WITH CHECK (student_id = get_student_id(auth.uid()));

CREATE POLICY "Teachers can view reschedule requests for their classes"
ON public.reschedule_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_id AND c.teacher_id = get_teacher_id(auth.uid())
  )
);

CREATE POLICY "Teachers can update reschedule requests"
ON public.reschedule_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_id AND c.teacher_id = get_teacher_id(auth.uid())
  )
  OR is_admin(auth.uid())
);

-- 12. RLS Policies for student_feedback
CREATE POLICY "Students can view their feedback"
ON public.student_feedback FOR SELECT
USING (student_id = get_student_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Students can create feedback for their completed classes"
ON public.student_feedback FOR INSERT
WITH CHECK (
  student_id = get_student_id(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_id 
    AND c.student_id = get_student_id(auth.uid())
    AND c.status = 'completed'
  )
);

CREATE POLICY "Teachers can view feedback for their classes"
ON public.student_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes c 
    WHERE c.id = class_id AND c.teacher_id = get_teacher_id(auth.uid())
  )
);

-- 13. Update students table RLS to allow students to view/update their own record
CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Students can update their own record"
ON public.students FOR UPDATE
USING (user_id = auth.uid());

-- 14. Allow students to view classes they're part of
CREATE POLICY "Students can view their classes"
ON public.classes FOR SELECT
USING (student_id = get_student_id(auth.uid()));

-- 15. Allow students to view their lessons (read-only)
CREATE POLICY "Students can view their lessons"
ON public.lessons FOR SELECT
USING (student_id = get_student_id(auth.uid()));

-- 16. Allow students to view their attendance
CREATE POLICY "Students can view their attendance"
ON public.attendance FOR SELECT
USING (student_id = get_student_id(auth.uid()));

-- 17. Grant SELECT on teachers_public view to authenticated users
GRANT SELECT ON public.teachers_public TO authenticated;

-- 18. Triggers for updated_at
CREATE TRIGGER update_student_settings_updated_at
BEFORE UPDATE ON public.student_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 19. Enable realtime for connection_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;
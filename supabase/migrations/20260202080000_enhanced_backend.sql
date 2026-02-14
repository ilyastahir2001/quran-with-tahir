-- ==========================================
-- Enhanced Backend - Optimization & Auditing
-- ==========================================
-- 1. Create Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR
SELECT USING (public.is_admin(auth.uid()));
-- 2. Audit Trigger Function
CREATE OR REPLACE FUNCTION public.track_changes() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by
    )
VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE
            WHEN TG_OP = 'DELETE'
            or TG_OP = 'UPDATE' THEN to_jsonb(OLD)
            ELSE NULL
        END,
        CASE
            WHEN TG_OP = 'INSERT'
            or TG_OP = 'UPDATE' THEN to_jsonb(NEW)
            ELSE NULL
        END,
        auth.uid()
    );
RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Apply Audit Trigger to Critical Tables
DO $$
DECLARE t TEXT;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'profiles',
        'teachers',
        'students',
        'classes',
        'lessons',
        'salary_records',
        'user_roles'
    ) LOOP EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.track_changes()',
        t,
        t
    );
END LOOP;
END $$;
-- 4. Enhanced RLS for Messaging
-- Ensure sender_type matches the user's actual role
CREATE OR REPLACE FUNCTION public.get_student_id(_user_id UUID) RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
SELECT id
FROM public.students
WHERE user_id = _user_id
LIMIT 1 $$;
DROP POLICY IF EXISTS "Teachers can send messages" ON public.teacher_student_messages;
CREATE POLICY "Teachers can send messages" ON public.teacher_student_messages FOR
INSERT WITH CHECK (
        teacher_id = get_teacher_id(auth.uid())
        AND sender_type = 'teacher'
        AND (
            public.is_admin(auth.uid())
            OR EXISTS (
                SELECT 1
                FROM public.students
                WHERE id = student_id
                    AND teacher_id = get_teacher_id(auth.uid())
            )
        )
    );
-- 5. Data Validation Constraints
ALTER TABLE public.classes
ADD CONSTRAINT class_time_order CHECK (
        actual_end_time IS NULL
        OR actual_end_time >= actual_start_time
    );
ALTER TABLE public.lessons
ADD CONSTRAINT lesson_pages_order CHECK (
        page_to IS NULL
        OR page_to >= page_from
    );
-- 6. Performance View for Admin Statistics
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT (
        SELECT count(*)
        FROM public.students
    ) as total_students,
    (
        SELECT count(*)
        FROM public.teachers
    ) as total_teachers,
    (
        SELECT count(*)
        FROM public.classes
        WHERE scheduled_date = CURRENT_DATE
    ) as today_classes,
    (
        SELECT count(*)
        FROM public.lessons
        WHERE created_at >= date_trunc('month', now())
    ) as monthly_lessons;
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;
-- 7. Optimized Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
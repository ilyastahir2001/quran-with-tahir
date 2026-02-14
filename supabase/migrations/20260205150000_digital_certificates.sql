-- Phase 16.6: Digital Certificates & Graduation System
-- Create certificates table to store verified credentials
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE
    SET NULL,
        grading_id UUID REFERENCES public.exam_grading(id) ON DELETE
    SET NULL,
        certificate_type TEXT NOT NULL,
        -- 'surah', 'juz', 'full_quran', 'level_completion'
        title TEXT NOT NULL,
        issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
        verification_code TEXT UNIQUE NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        -- Store scores, examiner name, etc.
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
-- Policies
CREATE POLICY "Students can view their own certificates" ON public.certificates FOR
SELECT USING (
        student_id = get_student_id(auth.uid())
        OR is_admin(auth.uid())
    );
CREATE POLICY "Anyone can verify a certificate by code" ON public.certificates FOR
SELECT USING (true);
-- Updated at trigger
CREATE TRIGGER set_certificates_updated_at BEFORE
UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- Index for verification
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON public.certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON public.certificates(student_id);
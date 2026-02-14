-- Fix: Add missing RLS policies for students to view their own record
-- This fixes the login loading issue where students can't fetch their own data
-- Allow students to view their own record
CREATE POLICY "Students can view own record" ON public.students FOR
SELECT USING (auth.uid() = user_id);
-- Allow students to update their own record
CREATE POLICY "Students can update own record" ON public.students FOR
UPDATE USING (auth.uid() = user_id);
-- Also need to add policies for students to view their classes
CREATE POLICY "Students can view their classes" ON public.classes FOR
SELECT USING (
        student_id IN (
            SELECT id
            FROM public.students
            WHERE user_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
    );
-- Allow students to view their lessons
CREATE POLICY "Students can view their lessons" ON public.lessons FOR
SELECT USING (
        student_id IN (
            SELECT id
            FROM public.students
            WHERE user_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
    );
-- Allow students to view their attendance
CREATE POLICY "Students can view their attendance" ON public.attendance FOR
SELECT USING (
        student_id IN (
            SELECT id
            FROM public.students
            WHERE user_id = auth.uid()
        )
        OR public.is_admin(auth.uid())
    );
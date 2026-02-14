-- ==========================================
-- Fix: Add missing tables to supabase_realtime publication
-- This enables real-time subscriptions for all tables the frontend expects
-- ==========================================
-- Add all tables that the frontend subscribes to for real-time updates
-- Admin Dashboard needs these tables:
-- We use a DO block to safely add tables only if they aren't already in the publication
DO $$
DECLARE table_name text;
tables text [] := ARRAY [
        'teachers', 'students', 'payments', 
        'tasks', 'lessons', 
        'attendance', 'exam_requests', 'exams', 'reminders', 'complaints', 'salary_records',
        'user_roles', 'profiles',
        'achievements', 'student_achievements', 'student_certificates',
        'student_avatars', 'avatar_inventory'
    ];
BEGIN FOREACH table_name IN ARRAY tables LOOP -- check if table exists first to avoid errors
IF EXISTS (
    SELECT
    FROM pg_tables
    WHERE schemaname = 'public'
        AND tablename = table_name
) THEN -- We just try to add it, ignoring errors if it's already there is hard with simple ALTER PUBLICATION
-- So commonly we just run it and let it fail or wrap in exception? 
-- Actually, simpler approach: drop and recreate or just run ALTER and catch duplicate error?
-- Postgres 15+ allows ADD TABLE ... but earlier ones fail if exists?
-- Supabase is on pg15 usually. 
-- BUT 'IF NOT EXISTS' was definitely wrong syntax.
-- Let's just run it plainly. If it's already there, it might throw or be a no-op?
-- "ALTER PUBLICATION name ADD TABLE table_name" throws if already in publication.
-- Safe approach: Check pg_publication_tables
IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
) THEN EXECUTE format(
    'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
    table_name
);
END IF;
END IF;
END LOOP;
END $$;
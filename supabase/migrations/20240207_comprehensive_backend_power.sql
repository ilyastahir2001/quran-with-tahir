-- 1. Enable Core Extensions (Explicitly using 'extensions' schema for Supabase best practice)
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgvector" WITH SCHEMA "extensions";
-- Set search path to include extensions
ALTER ROLE authenticated
SET search_path TO "$user",
    public,
    extensions;
ALTER ROLE postgres
SET search_path TO "$user",
    public,
    extensions;
-- 2. Performance: Strategic Indices
-- B-Tree indices for foreign keys and frequent lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_user_id ON public.auth_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_created_at ON public.auth_activity_logs(created_at);
-- GIN indices for JSONB performance (metadata search)
CREATE INDEX IF NOT EXISTS idx_profiles_metadata_gin ON public.profiles USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_metadata_gin ON public.auth_activity_logs USING GIN (metadata);
-- 3. Automation: PG_CRON Jobs
-- Job 1: Daily cleanup of old logs (keep logs for 90 days)
SELECT cron.schedule(
        'cleanup-old-auth-logs',
        '0 0 * * *',
        -- Every night at midnight
        $$
        DELETE FROM public.auth_activity_logs
        WHERE created_at < now() - interval '90 days' $$
    );
-- Job 2: Example Streak Monitor (Placeholder for a function call)
-- SELECT cron.schedule('daily-streak-check', '0 1 * * *', 'SELECT refresh_student_streaks()');
-- 4. Security: Enhanced Audit Triggers
-- Function to log profile updates automatically
CREATE OR REPLACE FUNCTION public.log_profile_changes() RETURNS TRIGGER AS $$ BEGIN IF (
        OLD.full_name IS DISTINCT
        FROM NEW.full_name
            OR OLD.phone IS DISTINCT
        FROM NEW.phone
    ) THEN
INSERT INTO public.auth_activity_logs (user_id, event_type, metadata)
VALUES (
        NEW.user_id,
        'profile_update',
        jsonb_build_object(
            'old_name',
            OLD.full_name,
            'new_name',
            NEW.full_name,
            'field_changed',
            'bio_data'
        )
    );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS tr_log_profile_changes ON public.profiles;
CREATE TRIGGER tr_log_profile_changes
AFTER
UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();
-- 5. Quality: RLS Policy Audit (Ensuring strict ownership)
ALTER TABLE public.auth_activity_logs ENABLE ROW LEVEL SECURITY;
-- Ensure users can only see their own logs
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.auth_activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.auth_activity_logs FOR
SELECT TO authenticated USING (auth.uid() = user_id);
-- ==========================================
-- Admin Enhancements & Missing Columns
-- ==========================================
-- 1. Ensure `teachers` has all feature columns
DO $$ BEGIN -- Add is_verified if missing (Revoke Verification feature)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'teachers'
        AND column_name = 'is_verified'
) THEN
ALTER TABLE public.teachers
ADD COLUMN is_verified BOOLEAN DEFAULT false;
END IF;
-- Add is_profile_hidden if missing (Hide from Search feature)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'teachers'
        AND column_name = 'is_profile_hidden'
) THEN
ALTER TABLE public.teachers
ADD COLUMN is_profile_hidden BOOLEAN DEFAULT false;
END IF;
-- Add verification_notes for admin feedback
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'teachers'
        AND column_name = 'verification_notes'
) THEN
ALTER TABLE public.teachers
ADD COLUMN verification_notes TEXT;
END IF;
END $$;
-- 2. Ensure `students` has all feature columns for admin management
DO $$ BEGIN -- Add teacher_selection_mode if missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'students'
        AND column_name = 'teacher_selection_mode'
) THEN
ALTER TABLE public.students
ADD COLUMN teacher_selection_mode TEXT DEFAULT 'self';
-- 'self' or 'academy'
END IF;
END $$;
-- 3. Create view for "Live Classes" if complex query is needed (Simpler to query directly, but useful for RLS safe views)
-- (Skipping view creation as direct querying on 'status' column is sufficient for now)
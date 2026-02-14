-- Phase 16.5: Avatars & Leaderboards
-- 1. Add metadata to profiles if it doesn't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'metadata'
) THEN
ALTER TABLE public.profiles
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
END IF;
END $$;
-- 2. Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 3. Create student_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, achievement_id)
);
-- 4. Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
-- 5. Policies
-- 5. Policies
-- Create policies only if they don't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'achievements'
        AND policyname = 'Anyone can view achievements'
) THEN CREATE POLICY "Anyone can view achievements" ON public.achievements FOR
SELECT USING (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'student_achievements'
        AND policyname = 'Students can view their own achievements'
) THEN CREATE POLICY "Students can view their own achievements" ON public.student_achievements FOR
SELECT USING (
        student_id = get_student_id(auth.uid())
        OR is_admin(auth.uid())
    );
END IF;
END $$;
-- 6. Insert initial achievements
INSERT INTO public.achievements (
        title,
        description,
        icon,
        requirement_type,
        requirement_value
    )
VALUES (
        'Consistent Student',
        'Completed 10 lessons',
        'Trophy',
        'lessons_count',
        10
    ),
    (
        'Weekly Warrior',
        'Maintained a 7-day streak',
        'Flame',
        'streak_days',
        7
    ),
    (
        'Knowledge Seeker',
        'Completed Juzz 30',
        'BookOpen',
        'juz_completed',
        30
    ),
    (
        'Early Bird',
        'Perfect punctuality for a month',
        'Clock',
        'punctuality_index',
        90
    ) ON CONFLICT DO NOTHING;
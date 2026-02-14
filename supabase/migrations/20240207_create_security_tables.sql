-- Create a table to track user authentication activity
CREATE TABLE IF NOT EXISTS public.auth_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    -- 'login', 'logout', 'register', 'password_update', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Store IP, User Agent, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable Row Level Security
ALTER TABLE public.auth_activity_logs ENABLE ROW LEVEL SECURITY;
-- Policy: Users can insert their own logs (authentificated)
CREATE POLICY "Users can insert their own activity logs" ON public.auth_activity_logs FOR
INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own activity logs" ON public.auth_activity_logs FOR
SELECT TO authenticated USING (auth.uid() = user_id);
-- Policy: Admins can view all logs (assuming you have an admin role logic)
-- Note: Adjust this policy based on your specific admin role implementation (e.g., specific email, user_metadata, or a join with user_roles)
-- For now, we will leave it restricted to self-view to be safe, or allow if user has 'admin' role in user_roles table
CREATE POLICY "Admins can view all logs" ON public.auth_activity_logs FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.user_roles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        target_resource TEXT NOT NULL,
        details JSONB,
        ip_address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
-- Admins can view all logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR
SELECT USING (public.is_admin(auth.uid()));
-- Insert some sample logs for visualization
INSERT INTO public.audit_logs (
        user_id,
        action,
        target_resource,
        details,
        ip_address
    )
VALUES (
        auth.uid(),
        'LOGIN',
        'auth',
        '{"method": "password"}',
        '127.0.0.1'
    ),
    (
        auth.uid(),
        'VIEW_DASHBOARD',
        'admin_dashboard',
        '{}',
        '127.0.0.1'
    );
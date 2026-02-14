-- ==========================================
-- System Settings & Configuration Module
-- ==========================================
-- 1. Create System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    -- If true, can be read by anon users (e.g. maintenance mode check)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);
-- 2. Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
-- 3. Policies
-- Admins can manage all settings
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (public.is_admin(auth.uid()));
-- Public/Authenticated users can view public settings
CREATE POLICY "Public read public settings" ON public.system_settings FOR
SELECT USING (is_public = true);
-- 4. Initial Seed Data (Safe Idempotent Insert)
INSERT INTO public.system_settings (key, value, description, is_public)
VALUES (
        'maintenance_mode',
        'false'::jsonb,
        'Disable public access for updates',
        true
    ),
    (
        'allow_signups',
        'true'::jsonb,
        'Enable new student registrations',
        true
    ),
    (
        'platform_name',
        '"WARM Academy"'::jsonb,
        'Name of the academy',
        true
    ),
    (
        'default_currency',
        '"USD"'::jsonb,
        'Default currency symbol',
        true
    ),
    (
        'primary_language',
        '"English"'::jsonb,
        'Default UI language',
        true
    ) ON CONFLICT (key) DO NOTHING;
-- 5. Audit Trigger for Settings
CREATE TRIGGER set_system_settings_updated_at BEFORE
UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- 6. Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.system_settings;
-- Fix RLS policies for user_roles
-- This ensures that users can read their own roles and admins can verify permissions
-- Enable RLS (idempotent)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to remove clutter and conflicts
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
-- Allow users to read their own roles (Unified Policy)
CREATE POLICY "Users can read own roles" ON public.user_roles FOR
SELECT USING (auth.uid() = user_id);
-- Allow admins to read all roles (for user management)
CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.is_admin(auth.uid()));
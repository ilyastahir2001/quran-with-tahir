-- Fix the overly permissive notifications insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive policy - only admins or the user themselves can insert notifications
CREATE POLICY "Authenticated users can receive notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
-- Update the trigger to NOT auto-assign roles when signing up via OAuth
-- Only create profile, let the frontend handle role selection

CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role text;
  _is_parent boolean;
BEGIN
  -- Get the role from user metadata (will be null for OAuth signups)
  _role := NEW.raw_user_meta_data->>'role';
  
  -- Always create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Only create role-specific records if role was explicitly provided
  -- (from manual signup form, not OAuth)
  IF _role IS NOT NULL THEN
    _is_parent := (_role = 'parent');
    
    IF _role = 'teacher' THEN
      INSERT INTO public.teachers (user_id)
      VALUES (NEW.id)
      ON CONFLICT DO NOTHING;
      
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'teacher')
      ON CONFLICT DO NOTHING;
      
    ELSIF _role IN ('student', 'parent') THEN
      INSERT INTO public.students (user_id, full_name, email, is_parent_account)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        _is_parent
      )
      ON CONFLICT DO NOTHING;
      
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  -- If no role specified (OAuth), user will be redirected to role selection page
  
  RETURN NEW;
END;
$function$;
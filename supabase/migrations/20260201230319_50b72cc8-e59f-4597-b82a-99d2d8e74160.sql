-- Create trigger to handle new user registration with roles

-- Function to handle user role setup on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role text;
  _is_parent boolean;
BEGIN
  -- Get the role from user metadata
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  _is_parent := (_role = 'parent');
  
  -- Create profile (this might already exist from handle_new_user)
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Handle role-specific record creation
  IF _role = 'teacher' THEN
    -- Create teacher record
    INSERT INTO public.teachers (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
    
    -- Assign teacher role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'teacher')
    ON CONFLICT DO NOTHING;
    
  ELSIF _role IN ('student', 'parent') THEN
    -- Create student record
    INSERT INTO public.students (user_id, full_name, email, is_parent_account)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      _is_parent
    )
    ON CONFLICT DO NOTHING;
    
    -- Assign student role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS on_auth_user_created_with_role ON auth.users;

CREATE TRIGGER on_auth_user_created_with_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_with_role();
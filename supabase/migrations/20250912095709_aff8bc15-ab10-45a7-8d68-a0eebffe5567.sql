-- Update the handle_new_user function to handle created_by_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, created_by_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'accountant'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'created_by_admin' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'created_by_admin')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$;
-- Add created_by_admin field to profiles table to track which admin created each accountant
ALTER TABLE public.profiles 
ADD COLUMN created_by_admin UUID REFERENCES public.profiles(user_id);

-- Create security definer function to get user role without recursive RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Create security definer function to get admin who created the user
CREATE OR REPLACE FUNCTION public.get_created_by_admin(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT created_by_admin FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Update accounts RLS policies to respect admin-accountant hierarchy
DROP POLICY IF EXISTS "Users can manage accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view all accounts" ON public.accounts;

CREATE POLICY "Admins can manage all accounts"
ON public.accounts
FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Accountants can manage accounts from their admin"
ON public.accounts
FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'accountant' AND
  (user_id = auth.uid() OR 
   user_id IN (
     SELECT user_id FROM public.profiles 
     WHERE created_by_admin = public.get_created_by_admin(auth.uid())
   ) OR
   user_id = public.get_created_by_admin(auth.uid())
  )
);

-- Update customers RLS policies
DROP POLICY IF EXISTS "Users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;

CREATE POLICY "Admins can manage all customers"
ON public.customers
FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Accountants can manage customers from their admin"
ON public.customers
FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'accountant' AND
  (user_id = auth.uid() OR 
   user_id IN (
     SELECT user_id FROM public.profiles 
     WHERE created_by_admin = public.get_created_by_admin(auth.uid())
   ) OR
   user_id = public.get_created_by_admin(auth.uid())
  )
);

-- Update merchants RLS policies
DROP POLICY IF EXISTS "Users can manage merchants" ON public.merchants;
DROP POLICY IF EXISTS "Users can view all merchants" ON public.merchants;

CREATE POLICY "Admins can manage all merchants"
ON public.merchants
FOR ALL
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Accountants can manage merchants from their admin"
ON public.merchants
FOR ALL
USING (
  public.get_user_role(auth.uid()) = 'accountant' AND
  (user_id = auth.uid() OR 
   user_id IN (
     SELECT user_id FROM public.profiles 
     WHERE created_by_admin = public.get_created_by_admin(auth.uid())
   ) OR
   user_id = public.get_created_by_admin(auth.uid())
  )
);

-- Update profiles RLS policies to allow admins to manage their accountants
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view their accountants"
ON public.profiles
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'admin' AND
  (auth.uid() = user_id OR created_by_admin = auth.uid())
);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their accountants"
ON public.profiles
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'admin' AND
  created_by_admin = auth.uid()
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create accountants"
ON public.profiles
FOR INSERT
WITH CHECK (
  public.get_user_role(auth.uid()) = 'admin' AND
  role = 'accountant' AND
  created_by_admin = auth.uid()
);
-- Update RLS policies to restrict accountants to only their own data

-- Drop existing policies for accountants
DROP POLICY IF EXISTS "Accountants can manage accounts from their admin" ON public.accounts;
DROP POLICY IF EXISTS "Accountants can manage customers from their admin" ON public.customers;
DROP POLICY IF EXISTS "Accountants can manage merchants from their admin" ON public.merchants;

-- Create new restrictive policies for accountants
CREATE POLICY "Accountants can manage their own accounts" 
ON public.accounts 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'accountant'::user_role) AND (user_id = auth.uid())
);

CREATE POLICY "Accountants can manage their own customers" 
ON public.customers 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'accountant'::user_role) AND (user_id = auth.uid())
);

CREATE POLICY "Accountants can manage their own merchants" 
ON public.merchants 
FOR ALL 
USING (
  (get_user_role(auth.uid()) = 'accountant'::user_role) AND (user_id = auth.uid())
);
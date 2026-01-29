-- Add new fields to accounts table
ALTER TABLE public.accounts 
ADD COLUMN internet_banking_id TEXT,
ADD COLUMN internet_banking_password TEXT,
ADD COLUMN account_provided_by TEXT,
ADD COLUMN account_given_to TEXT,
ADD COLUMN aadhaar_front_image_url TEXT,
ADD COLUMN aadhaar_back_image_url TEXT,
ADD COLUMN atm_pin TEXT,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Add account_id to merchants table to link merchants to accounts
ALTER TABLE public.merchants 
ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;
-- Add approval status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Add approved_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN approved_at timestamp with time zone;

-- Add approved_by to track which admin approved
ALTER TABLE public.profiles 
ADD COLUMN approved_by uuid;

-- Update existing profiles to be approved (so current users aren't locked out)
UPDATE public.profiles SET is_approved = true, approved_at = now();
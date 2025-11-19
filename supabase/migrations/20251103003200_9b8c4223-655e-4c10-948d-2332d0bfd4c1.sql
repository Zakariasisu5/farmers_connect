-- Add region field to profiles table
ALTER TABLE public.profiles
ADD COLUMN region TEXT DEFAULT 'Central Region';
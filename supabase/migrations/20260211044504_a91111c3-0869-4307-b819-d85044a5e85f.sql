-- Force RLS on profiles table to prevent bypass by table owner
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
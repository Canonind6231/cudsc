-- Add is_active column to profiles (default true for existing users)
ALTER TABLE public.profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Allow admins to update any profile (for toggling is_active)
-- Existing policy "Users can update own profile" already covers self-updates
-- We need a policy for admins to update other profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
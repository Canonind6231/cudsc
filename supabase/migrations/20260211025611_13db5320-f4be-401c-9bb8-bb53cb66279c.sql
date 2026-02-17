
-- Fix profiles SELECT policies: convert from RESTRICTIVE to PERMISSIVE
-- RESTRICTIVE-only policies can block all access since PostgreSQL requires at least one PERMISSIVE policy to grant access

DROP POLICY "Users can view own profile" ON public.profiles;
DROP POLICY "Admins can view all profiles" ON public.profiles;

-- Recreate as PERMISSIVE (default) so they grant access properly
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));


-- Fix profiles policies: change from public to authenticated role

-- "Users can view own profile" - currently targets public role
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- "Admins can view all profiles" - currently targets public role
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- "Admins can update all profiles" - currently targets public role
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- "Admins can delete profiles" - currently targets public role
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix projects policies: change from public to authenticated role

-- "Admins can delete any project" - currently targets public role
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
CREATE POLICY "Admins can delete any project"
  ON public.projects FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- "Users can update projects based on role" - currently targets public role
DROP POLICY IF EXISTS "Users can update projects based on role" ON public.projects;
CREATE POLICY "Users can update projects based on role"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (
    ((requester_id = auth.uid()) AND (status = 'pending'::project_status))
    OR has_role(auth.uid(), 'reviewer'::app_role)
    OR has_role(auth.uid(), 'approver'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

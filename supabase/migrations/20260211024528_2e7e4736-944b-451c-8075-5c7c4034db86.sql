
-- Drop the existing update policy
DROP POLICY "Users can update projects based on role" ON public.projects;

-- Recreate with admin included
CREATE POLICY "Users can update projects based on role"
ON public.projects
FOR UPDATE
USING (
  ((requester_id = auth.uid()) AND (status = 'pending'::project_status))
  OR has_role(auth.uid(), 'reviewer'::app_role)
  OR has_role(auth.uid(), 'approver'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

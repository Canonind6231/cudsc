
-- =============================================
-- FIX 1: profiles - restrict SELECT to own + admin
-- =============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- FIX 2: projects - role-based SELECT
-- =============================================
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;

-- Requesters see only their own projects
CREATE POLICY "Requesters can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

-- Reviewers, approvers, admins see all projects
CREATE POLICY "Privileged roles can view all projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'reviewer'::app_role)
    OR has_role(auth.uid(), 'approver'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- =============================================
-- FIX 3: project_audit_log - scoped to accessible projects
-- =============================================
DROP POLICY IF EXISTS "Users can view audit logs" ON public.project_audit_log;

-- Users can view audit logs for their own projects
CREATE POLICY "Users can view own project audit logs"
  ON public.project_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_audit_log.project_id
        AND projects.requester_id = auth.uid()
    )
  );

-- Privileged roles can view all audit logs
CREATE POLICY "Privileged roles can view all audit logs"
  ON public.project_audit_log FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'reviewer'::app_role)
    OR has_role(auth.uid(), 'approver'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- =============================================
-- FIX 4: project_attachments - scoped to accessible projects
-- =============================================
DROP POLICY IF EXISTS "Users can view project attachments" ON public.project_attachments;

-- Users can view attachments for their own projects
CREATE POLICY "Users can view own project attachments"
  ON public.project_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_attachments.project_id
        AND projects.requester_id = auth.uid()
    )
  );

-- Privileged roles can view all attachments
CREATE POLICY "Privileged roles can view all attachments"
  ON public.project_attachments FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'reviewer'::app_role)
    OR has_role(auth.uid(), 'approver'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

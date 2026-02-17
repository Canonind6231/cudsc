-- Allow admins to delete any project
CREATE POLICY "Admins can delete any project"
ON public.projects
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any project attachments
CREATE POLICY "Admins can delete any project attachments"
ON public.project_attachments
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any audit log entries
CREATE POLICY "Admins can delete audit log entries"
ON public.project_audit_log
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles (for user account deletion)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));
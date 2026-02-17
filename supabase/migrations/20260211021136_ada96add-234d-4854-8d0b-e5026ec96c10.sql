
-- Fix storage policies: restrict file access by ownership/role
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;

-- Users can view their own uploaded files (folder structure: {user_id}/{project_id}/{filename})
CREATE POLICY "Users can view own attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Privileged roles can view all attachments
CREATE POLICY "Staff can view all attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'project-attachments'
    AND (
      has_role(auth.uid(), 'reviewer'::app_role)
      OR has_role(auth.uid(), 'approver'::app_role)
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

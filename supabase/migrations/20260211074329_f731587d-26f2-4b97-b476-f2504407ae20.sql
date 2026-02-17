-- Drop the overly permissive storage SELECT policy
DROP POLICY IF EXISTS "Users can view attachments" ON storage.objects;

-- Create a scoped policy that checks project ownership or privileged role
CREATE POLICY "Users can view own project attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-attachments' AND
  EXISTS (
    SELECT 1 FROM public.project_attachments pa
    JOIN public.projects p ON pa.project_id = p.id
    WHERE pa.storage_path = name
      AND (p.requester_id = auth.uid()
           OR public.has_role(auth.uid(), 'reviewer'::app_role)
           OR public.has_role(auth.uid(), 'approver'::app_role)
           OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);
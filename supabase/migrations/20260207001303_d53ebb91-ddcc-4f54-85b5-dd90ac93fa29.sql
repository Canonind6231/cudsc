-- Create storage bucket for project attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-attachments', 'project-attachments', false);

-- Storage policies for project attachments
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-attachments');

CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project-attachments');

CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
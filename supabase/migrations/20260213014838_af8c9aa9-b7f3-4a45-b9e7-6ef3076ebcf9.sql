-- Fix: Change RESTRICTIVE policies to PERMISSIVE on user_access_log
DROP POLICY "Admins can view all access logs" ON public.user_access_log;
DROP POLICY "Users can insert own access log" ON public.user_access_log;
DROP POLICY "Admins can delete access logs" ON public.user_access_log;

CREATE POLICY "Admins can view all access logs"
ON public.user_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own access log"
ON public.user_access_log
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete access logs"
ON public.user_access_log
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
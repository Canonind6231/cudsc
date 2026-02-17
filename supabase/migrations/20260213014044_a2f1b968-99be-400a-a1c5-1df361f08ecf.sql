
-- Create user access log table
CREATE TABLE public.user_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'login',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admins can view all access logs"
ON public.user_access_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Any authenticated user can insert their own access log
CREATE POLICY "Users can insert own access log"
ON public.user_access_log FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can delete access logs
CREATE POLICY "Admins can delete access logs"
ON public.user_access_log FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_user_access_log_created_at ON public.user_access_log (created_at DESC);
CREATE INDEX idx_user_access_log_user_id ON public.user_access_log (user_id);

-- Create function to clean up entries older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_access_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.user_access_log
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

-- Create a trigger that runs cleanup on each insert (lightweight, only deletes old rows)
CREATE OR REPLACE FUNCTION public.trigger_cleanup_access_logs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Run cleanup roughly 1% of the time to avoid overhead on every insert
  IF random() < 0.01 THEN
    PERFORM public.cleanup_old_access_logs();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_access_logs_trigger
AFTER INSERT ON public.user_access_log
FOR EACH ROW
EXECUTE FUNCTION public.trigger_cleanup_access_logs();

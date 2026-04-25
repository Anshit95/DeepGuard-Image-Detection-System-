
-- Drop overly permissive policies
DROP POLICY "Anyone can insert failed attempts" ON public.failed_login_attempts;
DROP POLICY "Anyone can update failed attempts" ON public.failed_login_attempts;
DROP POLICY "Anyone can delete failed attempts" ON public.failed_login_attempts;

-- Create a security definer function to handle failed login tracking
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  attempt_record RECORD;
BEGIN
  -- Clean up old attempts (older than 30 minutes)
  DELETE FROM public.failed_login_attempts 
  WHERE updated_at < now() - INTERVAL '30 minutes';
  
  -- Check current status
  SELECT * INTO attempt_record 
  FROM public.failed_login_attempts 
  WHERE email = p_email;
  
  IF attempt_record IS NULL THEN
    result := json_build_object('locked', false, 'attempts', 0);
  ELSIF attempt_record.locked_until IS NOT NULL AND attempt_record.locked_until > now() THEN
    result := json_build_object('locked', true, 'locked_until', attempt_record.locked_until, 'attempts', attempt_record.attempt_count);
  ELSE
    result := json_build_object('locked', false, 'attempts', attempt_record.attempt_count);
  END IF;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INTEGER;
  lock_time TIMESTAMP WITH TIME ZONE;
BEGIN
  INSERT INTO public.failed_login_attempts (email, attempt_count, updated_at)
  VALUES (p_email, 1, now())
  ON CONFLICT (email) DO UPDATE SET
    attempt_count = public.failed_login_attempts.attempt_count + 1,
    updated_at = now()
  RETURNING attempt_count INTO new_count;
  
  -- Lock after 3 failed attempts for 15 minutes
  IF new_count >= 3 THEN
    lock_time := now() + INTERVAL '15 minutes';
    UPDATE public.failed_login_attempts 
    SET locked_until = lock_time 
    WHERE email = p_email;
    RETURN json_build_object('locked', true, 'locked_until', lock_time, 'attempts', new_count);
  END IF;
  
  RETURN json_build_object('locked', false, 'attempts', new_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_failed_logins(p_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.failed_login_attempts WHERE email = p_email;
END;
$$;

-- Add unique constraint on email for upsert
ALTER TABLE public.failed_login_attempts ADD CONSTRAINT failed_login_attempts_email_key UNIQUE (email);

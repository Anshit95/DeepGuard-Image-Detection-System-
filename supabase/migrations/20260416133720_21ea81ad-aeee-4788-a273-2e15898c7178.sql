ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS organization text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS recovery_email text;
-- Add CHECK constraint to enforce valid budget range
ALTER TABLE public.projects ADD CONSTRAINT budget_check CHECK (budget >= 0 AND budget <= 9999999999);
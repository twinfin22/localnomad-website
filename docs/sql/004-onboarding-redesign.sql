-- 004-onboarding-redesign.sql
-- Goal-first onboarding: rename columns, expand country constraint, add current_visa_type
-- Run in Supabase SQL Editor after 003-schema-hardening.sql

-- 1. Drop length constraint on old column name (if 003 was applied)
ALTER TABLE public.user_visas
  DROP CONSTRAINT IF EXISTS chk_visa_type_length;

-- 2. Expand country constraint to include Japan and China
ALTER TABLE public.user_visas
  DROP CONSTRAINT IF EXISTS user_visas_country_check;
ALTER TABLE public.user_visas
  ADD CONSTRAINT user_visas_country_check CHECK (country IN ('kr', 'tw', 'jp', 'cn'));

-- 3. Rename columns
ALTER TABLE public.user_visas RENAME COLUMN visa_type TO goal_visa_type;
ALTER TABLE public.user_visas RENAME COLUMN expiry_date TO current_expiry_date;

-- 4. Add current visa column
ALTER TABLE public.user_visas ADD COLUMN current_visa_type text;

-- 5. Re-add length constraint on new column name
ALTER TABLE public.user_visas
  ADD CONSTRAINT chk_goal_visa_type_length CHECK (char_length(goal_visa_type) <= 50);

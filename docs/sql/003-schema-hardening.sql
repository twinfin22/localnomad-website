-- 003-schema-hardening.sql
-- Phase B: Schema hardening constraints
-- Run in Supabase SQL Editor after 002-rls-performance.sql

ALTER TABLE public.user_visas
  ADD CONSTRAINT chk_visa_type_length CHECK (char_length(visa_type) <= 50);

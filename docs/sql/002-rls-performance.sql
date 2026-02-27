-- =============================================================================
-- Phase A: RLS Performance — Wrap auth.uid() in (select auth.uid())
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- 1. profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- 2. user_visas policies
DROP POLICY IF EXISTS "Users can read own visas" ON public.user_visas;
CREATE POLICY "Users can read own visas"
  ON public.user_visas FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own visas" ON public.user_visas;
CREATE POLICY "Users can insert own visas"
  ON public.user_visas FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own visas" ON public.user_visas;
CREATE POLICY "Users can update own visas"
  ON public.user_visas FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own visas" ON public.user_visas;
CREATE POLICY "Users can delete own visas"
  ON public.user_visas FOR DELETE
  USING ((select auth.uid()) = user_id);

-- 3. checklist_items policies
DROP POLICY IF EXISTS "Users can read own checklist items" ON public.checklist_items;
CREATE POLICY "Users can read own checklist items"
  ON public.checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own checklist items" ON public.checklist_items;
CREATE POLICY "Users can insert own checklist items"
  ON public.checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own checklist items" ON public.checklist_items;
CREATE POLICY "Users can update own checklist items"
  ON public.checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_visas
      WHERE user_visas.id = checklist_items.user_visa_id
        AND user_visas.user_id = (select auth.uid())
    )
  );

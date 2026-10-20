-- ============================================================================
-- Migration: 023_learn_more_cms_v2.sql
-- Description: Learn More CMS v2: Immutable Revision History, Atomic Publishing,
--              Rollback Engine, and Strict AAL2 Access Control
-- ============================================================================

BEGIN;

-- 1. Create learn_more_revisions table with uniqueness constraint
CREATE TABLE IF NOT EXISTS public.learn_more_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL,
  revision_number integer NOT NULL,
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  notes text,
  author_id uuid REFERENCES auth.users(id),
  author_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT learn_more_revisions_page_rev_unique UNIQUE (page_id, revision_number)
);

CREATE INDEX IF NOT EXISTS idx_learn_more_revisions_page_rev
  ON public.learn_more_revisions (page_id, revision_number DESC);

-- 2. Row Level Security for learn_more_revisions
ALTER TABLE public.learn_more_revisions ENABLE ROW LEVEL SECURITY;

-- Admins with AAL2 can read revisions
DROP POLICY IF EXISTS learn_more_revisions_admin_select ON public.learn_more_revisions;
CREATE POLICY learn_more_revisions_admin_select ON public.learn_more_revisions
  FOR SELECT TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

-- Admins with AAL2 can insert revisions
DROP POLICY IF EXISTS learn_more_revisions_admin_insert ON public.learn_more_revisions;
CREATE POLICY learn_more_revisions_admin_insert ON public.learn_more_revisions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

-- Explicitly revoke UPDATE and DELETE to ensure historical revisions are permanently immutable
REVOKE UPDATE, DELETE ON public.learn_more_revisions FROM authenticated, anon, public;
GRANT SELECT, INSERT ON public.learn_more_revisions TO authenticated;

-- 3. Atomic Publish Function
CREATE OR REPLACE FUNCTION public.publish_learn_more_page(
  p_page_id text,
  p_content jsonb,
  p_notes text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_next_rev integer;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Strict AAL2 admin authorization check
  IF NOT (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2') THEN
    RAISE EXCEPTION 'Unauthorized: Requires admin credentials with AAL2 MFA.';
  END IF;

  -- Validate json content
  IF p_content IS NULL OR jsonb_typeof(p_content) <> 'object' THEN
    RAISE EXCEPTION 'Invalid page content: must be a valid JSON object.';
  END IF;

  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  -- Calculate next revision number safely within transaction
  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO v_next_rev
  FROM public.learn_more_revisions
  WHERE page_id = p_page_id;

  -- 1. Insert immutable revision history
  INSERT INTO public.learn_more_revisions (
    page_id, revision_number, content, notes, author_id, author_email, created_at
  ) VALUES (
    p_page_id, v_next_rev, p_content, p_notes, v_user_id, v_user_email, now()
  );

  -- 2. Upsert published content
  INSERT INTO public.learn_more_published (id, content, updated_at)
  VALUES (p_page_id, p_content, now())
  ON CONFLICT (id) DO UPDATE
    SET content = EXCLUDED.content,
        updated_at = now();

  -- 3. Clear draft
  DELETE FROM public.learn_more_drafts WHERE id = p_page_id;

  RETURN v_next_rev;
END;
$$;

-- 4. Atomic Rollback Function
CREATE OR REPLACE FUNCTION public.rollback_learn_more_revision(
  p_page_id text,
  p_target_revision integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_target_content jsonb;
  v_next_rev integer;
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Strict AAL2 admin authorization check
  IF NOT (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2') THEN
    RAISE EXCEPTION 'Unauthorized: Requires admin credentials with AAL2 MFA.';
  END IF;

  -- Fetch content from historical revision
  SELECT content INTO v_target_content
  FROM public.learn_more_revisions
  WHERE page_id = p_page_id AND revision_number = p_target_revision;

  IF v_target_content IS NULL THEN
    RAISE EXCEPTION 'Revision % not found for page %.', p_target_revision, p_page_id;
  END IF;

  v_user_id := auth.uid();
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  SELECT COALESCE(MAX(revision_number), 0) + 1
  INTO v_next_rev
  FROM public.learn_more_revisions
  WHERE page_id = p_page_id;

  -- Create a NEW revision documenting the rollback rather than overwriting history
  INSERT INTO public.learn_more_revisions (
    page_id, revision_number, content, notes, author_id, author_email, created_at
  ) VALUES (
    p_page_id, v_next_rev, v_target_content, 'Rolled back to revision ' || p_target_revision, v_user_id, v_user_email, now()
  );

  -- Update published content
  INSERT INTO public.learn_more_published (id, content, updated_at)
  VALUES (p_page_id, v_target_content, now())
  ON CONFLICT (id) DO UPDATE
    SET content = EXCLUDED.content,
        updated_at = now();

  -- Clear draft
  DELETE FROM public.learn_more_drafts WHERE id = p_page_id;

  RETURN v_next_rev;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_learn_more_page(text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_learn_more_revision(text, integer) TO authenticated;

COMMIT;

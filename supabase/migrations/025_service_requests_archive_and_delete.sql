-- ==============================================================================
-- Migration 025: Service Requests Archiving, Safe Deletion & Realtime Delivery
-- ==============================================================================
BEGIN;

-- 1. Add archive and soft-delete columns to service_requests table
ALTER TABLE public.service_requests 
  ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archived_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by text DEFAULT NULL;

-- 2. Indexes for fast lifecycle filtering
CREATE INDEX IF NOT EXISTS idx_service_requests_archived_at ON public.service_requests (archived_at);
CREATE INDEX IF NOT EXISTS idx_service_requests_deleted_at ON public.service_requests (deleted_at);

-- 3. Audit table for all administrative service request actions
CREATE TABLE IF NOT EXISTS public.service_request_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid NOT NULL,
  reference text NOT NULL,
  service_type text NOT NULL,
  action text NOT NULL, -- 'archive', 'restore', 'soft_delete', 'hard_delete'
  actor_id text NOT NULL,
  actor_email text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_request_action_logs_req_id ON public.service_request_action_logs (service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_action_logs_created_at ON public.service_request_action_logs (created_at DESC);

-- 4. Enable RLS on audit table
ALTER TABLE public.service_request_action_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view service request action logs" ON public.service_request_action_logs;
CREATE POLICY "Admins can view service request action logs" ON public.service_request_action_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert service request action logs" ON public.service_request_action_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- 5. Grant permissions to authenticated role
GRANT UPDATE (archived_at, archived_by, deleted_at, deleted_by, updated_at, status, admin_notes) ON public.service_requests TO authenticated;
GRANT DELETE ON public.service_requests TO authenticated;
GRANT SELECT, INSERT ON public.service_request_action_logs TO authenticated;

-- 6. Delete policy for service_requests (restricted to AAL2 admins)
DROP POLICY IF EXISTS "Admins can delete service_requests" ON public.service_requests;
CREATE POLICY "Admins can delete service_requests" ON public.service_requests
  FOR DELETE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

-- 7. Add service_requests to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'service_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
  END IF;
END $$;

ALTER TABLE public.service_requests REPLICA IDENTITY FULL;

-- 8. Atomic Security Definer function for administrative archiving
CREATE OR REPLACE FUNCTION public.admin_archive_service_request(
  p_id uuid,
  p_actor_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor text;
  v_now timestamptz := now();
  v_ref text;
  v_type text;
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'authenticated') THEN
    RAISE EXCEPTION 'Unauthorized: Administrator access required.';
  END IF;

  v_actor := COALESCE(p_actor_id, auth.uid()::text, 'admin');

  SELECT reference, service_type INTO v_ref, v_type
  FROM public.service_requests
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  UPDATE public.service_requests
  SET archived_at = v_now,
      archived_by = v_actor,
      updated_at = v_now
  WHERE id = p_id;

  INSERT INTO public.service_request_action_logs (service_request_id, reference, service_type, action, actor_id, actor_email)
  VALUES (p_id, v_ref, v_type, 'archive', v_actor, (auth.jwt() ->> 'email'));

  RETURN jsonb_build_object('success', true, 'id', p_id, 'archived_at', v_now);
END;
$$;

-- 9. Atomic Security Definer function for administrative restoring
CREATE OR REPLACE FUNCTION public.admin_restore_service_request(
  p_id uuid,
  p_actor_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor text;
  v_now timestamptz := now();
  v_ref text;
  v_type text;
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'authenticated') THEN
    RAISE EXCEPTION 'Unauthorized: Administrator access required.';
  END IF;

  v_actor := COALESCE(p_actor_id, auth.uid()::text, 'admin');

  SELECT reference, service_type INTO v_ref, v_type
  FROM public.service_requests
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  UPDATE public.service_requests
  SET archived_at = NULL,
      archived_by = NULL,
      updated_at = v_now
  WHERE id = p_id;

  INSERT INTO public.service_request_action_logs (service_request_id, reference, service_type, action, actor_id, actor_email)
  VALUES (p_id, v_ref, v_type, 'restore', v_actor, (auth.jwt() ->> 'email'));

  RETURN jsonb_build_object('success', true, 'id', p_id);
END;
$$;

-- 10. Atomic Security Definer function for audited permanent deletion
CREATE OR REPLACE FUNCTION public.admin_hard_delete_service_request(
  p_id uuid,
  p_reason text DEFAULT NULL,
  p_actor_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor text;
  v_ref text;
  v_type text;
BEGIN
  IF NOT (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2' OR auth.role() = 'service_role')) THEN
    RAISE EXCEPTION 'Unauthorized: AAL2 MFA verification required for permanent service request purge.';
  END IF;

  v_actor := COALESCE(p_actor_id, auth.uid()::text, 'admin');

  SELECT reference, service_type INTO v_ref, v_type
  FROM public.service_requests
  WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Request not found');
  END IF;

  INSERT INTO public.service_request_action_logs (service_request_id, reference, service_type, action, actor_id, actor_email, reason, metadata)
  VALUES (p_id, v_ref, v_type, 'hard_delete', v_actor, (auth.jwt() ->> 'email'), p_reason, jsonb_build_object('hard', true));

  DELETE FROM public.service_requests WHERE id = p_id;

  RETURN jsonb_build_object('success', true, 'id', p_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_archive_service_request(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_restore_service_request(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_hard_delete_service_request(uuid, text, text) TO authenticated, anon;

COMMIT;

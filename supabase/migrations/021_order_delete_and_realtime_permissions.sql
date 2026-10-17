-- ==============================================================================
-- Migration 021: Fix Order Deletion, Archiving Permissions & Realtime Delivery
-- ==============================================================================
BEGIN;

-- 1. Grant column-level UPDATE on orders to authenticated
GRANT UPDATE (archived_at, archived_by, deleted_at, deleted_by, updated_at) ON public.orders TO authenticated;

-- 2. Grant DELETE privileges on orders and order_items to authenticated
GRANT DELETE ON public.orders TO authenticated;
GRANT DELETE ON public.order_items TO authenticated;

-- 3. Grant full privileges on order_action_logs to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_action_logs TO authenticated;

-- 4. Delete policies for orders and order_items (restricted to AAL2 admins)
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS "Admins can delete order_items" ON public.order_items;
CREATE POLICY "Admins can delete order_items" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

-- 5. Add orders to supabase_realtime publication for instant new order events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- 6. Atomic Security Definer function for administrative soft deletion
CREATE OR REPLACE FUNCTION public.admin_soft_delete_orders(
  p_order_ids uuid[],
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
  v_now timestamptz := now();
  v_count int;
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'authenticated') THEN
    RAISE EXCEPTION 'Unauthorized: Administrator access required.';
  END IF;

  v_actor := COALESCE(p_actor_id, auth.uid()::text, 'admin');

  UPDATE public.orders
  SET deleted_at = v_now,
      deleted_by = v_actor,
      updated_at = v_now
  WHERE id = ANY(p_order_ids)
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  INSERT INTO public.order_action_logs (order_id, reference_number, action, actor_id, actor_email, reason, metadata)
  SELECT o.id, o.reference_number, 'soft_delete', v_actor, (auth.jwt() ->> 'email'), p_reason, '{}'::jsonb
  FROM public.orders o
  WHERE o.id = ANY(p_order_ids);

  RETURN jsonb_build_object('success', true, 'count', v_count);
END;
$$;

-- 7. Atomic Security Definer function for audited permanent purge
CREATE OR REPLACE FUNCTION public.admin_hard_delete_orders(
  p_order_ids uuid[],
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
  v_count int;
BEGIN
  IF NOT (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2' OR auth.role() = 'service_role')) THEN
    RAISE EXCEPTION 'Unauthorized: AAL2 MFA verification required for permanent order purge.';
  END IF;

  v_actor := COALESCE(p_actor_id, auth.uid()::text, 'admin');

  INSERT INTO public.order_action_logs (order_id, reference_number, action, actor_id, actor_email, reason, metadata)
  SELECT o.id, o.reference_number, 'hard_delete', v_actor, (auth.jwt() ->> 'email'), p_reason, jsonb_build_object('total', o.total_amount, 'hard', true)
  FROM public.orders o
  WHERE o.id = ANY(p_order_ids);

  DELETE FROM public.order_items WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.orders WHERE id = ANY(p_order_ids);
  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'count', v_count);
END;
$$;

-- 8. Grant execution on administrative functions
GRANT EXECUTE ON FUNCTION public.admin_soft_delete_orders(uuid[], text, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.admin_hard_delete_orders(uuid[], text, text) TO authenticated, anon;

COMMIT;

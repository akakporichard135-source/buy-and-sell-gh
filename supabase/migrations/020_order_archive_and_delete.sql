-- ==============================================================================
-- Migration 020: Order Archiving, Safe Deletion & Audit Logging
-- ==============================================================================
BEGIN;

-- 1. Add archive and soft-delete columns to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archived_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by text DEFAULT NULL;

-- 2. Add indexes for high-performance filtering
CREATE INDEX IF NOT EXISTS idx_orders_archived_at ON public.orders (archived_at);
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON public.orders (deleted_at);

-- 3. Audit table for all administrative order actions (archive, restore, delete)
CREATE TABLE IF NOT EXISTS public.order_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  reference_number text NOT NULL,
  action text NOT NULL, -- 'archive', 'restore', 'soft_delete', 'hard_delete'
  actor_id text NOT NULL,
  actor_email text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_action_logs_order_id ON public.order_action_logs (order_id);
CREATE INDEX IF NOT EXISTS idx_order_action_logs_created_at ON public.order_action_logs (created_at DESC);

-- 4. Enable RLS on audit table
ALTER TABLE public.order_action_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view order action logs" ON public.order_action_logs;
CREATE POLICY "Admins can view order action logs" ON public.order_action_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert order action logs" ON public.order_action_logs;
CREATE POLICY "Admins can insert order action logs" ON public.order_action_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- 5. Delete policies for orders and order_items (restricted to AAL2 admins)
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS "Admins can delete order_items" ON public.order_items;
CREATE POLICY "Admins can delete order_items" ON public.order_items
  FOR DELETE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

COMMIT;

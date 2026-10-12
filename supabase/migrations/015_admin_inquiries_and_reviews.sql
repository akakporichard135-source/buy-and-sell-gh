-- ==============================================================================
-- Migration 015: Inquiries, Device Requests, and Customer Review Moderation
-- ==============================================================================
-- Least-privilege schema for trade-ins, pre-orders, and verified reviews.
-- Strictly requires public.is_admin() and AAL2 TOTP MFA for administrative operations.

-- 1. Trade-In & Device Swap Inquiries
CREATE TABLE IF NOT EXISTS public.trade_in_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  email text,
  device_type text,
  brand text NOT NULL,
  model text NOT NULL,
  storage text,
  condition text,
  desired_action text NOT NULL DEFAULT 'Sell' CHECK (desired_action IN ('Sell', 'Swap')),
  replacement_device text,
  known_issues text,
  battery_health text,
  message text,
  admin_notes text,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Review', 'Contacted', 'Appraised', 'Completed', 'Archived')),
  source text NOT NULL DEFAULT 'Website Form',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_in_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_ins_admin_all" ON public.trade_in_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

-- 2. Device Pre-Order & Sourcing Requests
CREATE TABLE IF NOT EXISTS public.device_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  email text,
  brand text NOT NULL DEFAULT 'Apple',
  model text NOT NULL,
  storage text,
  color text,
  budget text,
  message text,
  admin_notes text,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Under Review', 'Contacted', 'Sourced', 'Fulfilled', 'Archived')),
  source text NOT NULL DEFAULT 'Website Form',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_requests_admin_all" ON public.device_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

-- 3. Moderated Customer Reviews
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  order_reference text,
  product_id text,
  product_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Archived')),
  moderation_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- Public can ONLY read approved reviews
CREATE POLICY "reviews_public_read_approved" ON public.customer_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'Approved');

-- Admins with AAL2 MFA have full management access
CREATE POLICY "reviews_admin_all" ON public.customer_reviews
  FOR ALL
  TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

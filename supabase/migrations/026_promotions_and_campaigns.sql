-- ==============================================================================
-- Migration 026: Promotions & Campaigns Management System
-- ==============================================================================
-- Complete marketing and promotional campaigns architecture for Buy & Sell GH:
-- 1. promotions table: Full campaign registry (Free Gift, %, Fixed, Promo Price, Bundle, Ads)
-- 2. promotion_redemptions table: Audit log of customer redemptions linked to orders
-- 3. orders & order_items schema extension: discount amounts, promo snapshots, free gifts
-- 4. create_order_request_validated RPC update: authoritative server-side promotion validation,
--    free gift insertion, gift inventory decrement, and redemption tracking.
--
-- Security model:
-- - Public read access restricted to active, enabled campaigns within scheduled dates
-- - Admin full access (create, edit, archive, delete, performance review) restricted to authenticated admins
-- - Strict AAL2 TOTP MFA + public.is_admin() for all campaign mutations
-- - Idempotent: Safe to execute or rerun at any time without error.

BEGIN;

-- 1. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text DEFAULT '',
  detailed_description text DEFAULT '',
  promotion_type text NOT NULL CHECK (
    promotion_type IN ('free_gift', 'percentage_discount', 'fixed_discount', 'promotional_price', 'bundle', 'advertising')
  ),
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'scheduled', 'active', 'expired', 'archived', 'disabled')
  ),
  is_enabled boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  timezone text NOT NULL DEFAULT 'Africa/Accra',
  priority integer NOT NULL DEFAULT 0,
  allow_stacking boolean NOT NULL DEFAULT false,

  -- Target & Eligibility
  eligible_product_ids text[] DEFAULT '{}',
  eligible_category text DEFAULT 'all',
  eligible_variant_ids text[] DEFAULT '{}',
  eligible_storage_options text[] DEFAULT '{}',
  min_order_subtotal numeric(12,2) NOT NULL DEFAULT 0 CHECK (min_order_subtotal >= 0),

  -- Benefits
  discount_percent numeric(5,2) CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100)),
  discount_amount numeric(12,2) CHECK (discount_amount IS NULL OR discount_amount >= 0),
  promotional_price numeric(12,2) CHECK (promotional_price IS NULL OR promotional_price >= 0),
  
  -- Free Gift benefits
  gift_product_id text,
  gift_product_name text,
  gift_product_slug text,
  gift_product_image text,
  gift_quantity_per_purchase integer NOT NULL DEFAULT 1 CHECK (gift_quantity_per_purchase > 0),
  max_gifts_per_order integer NOT NULL DEFAULT 1 CHECK (max_gifts_per_order > 0),
  gift_stock_quantity integer NOT NULL DEFAULT 0 CHECK (gift_stock_quantity >= 0),
  gift_stock_alert_threshold integer NOT NULL DEFAULT 5 CHECK (gift_stock_alert_threshold >= 0),

  -- Bundle benefits
  bundle_required_product_ids text[] DEFAULT '{}',
  bundle_discount_amount numeric(12,2) CHECK (bundle_discount_amount IS NULL OR bundle_discount_amount >= 0),
  bundle_discount_percent numeric(5,2) CHECK (bundle_discount_percent IS NULL OR (bundle_discount_percent > 0 AND bundle_discount_percent <= 100)),

  -- Flyers & Presentation
  desktop_flyer_url text DEFAULT '',
  mobile_flyer_url text DEFAULT '',
  flyer_alt_text text DEFAULT '',
  cta_text text NOT NULL DEFAULT 'View Offer',
  cta_destination text NOT NULL DEFAULT '/offers',
  display_order integer NOT NULL DEFAULT 0,
  show_on_announcement_bar boolean NOT NULL DEFAULT false,
  announcement_bar_text text DEFAULT '',
  show_on_homepage_carousel boolean NOT NULL DEFAULT true,
  show_on_offers_page boolean NOT NULL DEFAULT true,

  -- Limits & Redemptions
  total_redemption_limit integer CHECK (total_redemption_limit IS NULL OR total_redemption_limit > 0),
  current_redemptions integer NOT NULL DEFAULT 0 CHECK (current_redemptions >= 0),
  customer_redemption_limit integer NOT NULL DEFAULT 1 CHECK (customer_redemption_limit > 0),

  -- Analytics & Counters
  view_count integer NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  click_count integer NOT NULL DEFAULT 0 CHECK (click_count >= 0),
  orders_count integer NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
  total_discount_given numeric(12,2) NOT NULL DEFAULT 0 CHECK (total_discount_given >= 0),
  total_gifts_allocated integer NOT NULL DEFAULT 0 CHECK (total_gifts_allocated >= 0),
  total_attributed_sales numeric(12,2) NOT NULL DEFAULT 0 CHECK (total_attributed_sales >= 0),

  created_by text DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promotions_status_idx ON public.promotions (status, is_enabled);
CREATE INDEX IF NOT EXISTS promotions_dates_idx ON public.promotions (start_date, end_date);
CREATE INDEX IF NOT EXISTS promotions_display_order_idx ON public.promotions (display_order);

-- 2. PROMOTION REDEMPTIONS AUDIT LOG
CREATE TABLE IF NOT EXISTS public.promotion_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id text NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  order_reference text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  discount_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  gift_product_id text,
  gift_quantity integer NOT NULL DEFAULT 0 CHECK (gift_quantity >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_redemptions_promo_id_idx ON public.promotion_redemptions (promotion_id);
CREATE INDEX IF NOT EXISTS promo_redemptions_order_ref_idx ON public.promotion_redemptions (order_reference);
CREATE INDEX IF NOT EXISTS promo_redemptions_phone_idx ON public.promotion_redemptions (customer_phone);

-- 3. ORDERS & ORDER_ITEMS SCHEMA EXTENSIONS
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  ADD COLUMN IF NOT EXISTS applied_promotion_id text,
  ADD COLUMN IF NOT EXISTS promotion_snapshot jsonb;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS is_free_gift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS promotional_discount numeric(12,2) NOT NULL DEFAULT 0 CHECK (promotional_discount >= 0),
  ADD COLUMN IF NOT EXISTS qualifying_product_id text,
  ADD COLUMN IF NOT EXISTS applied_promotion_id text;

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_redemptions ENABLE ROW LEVEL SECURITY;

-- Public can read active and enabled promotions within valid dates
DROP POLICY IF EXISTS "promotions_public_read" ON public.promotions;
CREATE POLICY "promotions_public_read" ON public.promotions
  FOR SELECT TO anon, authenticated
  USING (
    (status = 'active' AND is_enabled = true AND (start_date IS NULL OR start_date <= clock_timestamp()) AND (end_date IS NULL OR end_date >= clock_timestamp()))
    OR (public.is_admin())
  );

-- Admins have full access to promotions
DROP POLICY IF EXISTS "promotions_admin_all" ON public.promotions;
CREATE POLICY "promotions_admin_all" ON public.promotions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Redemptions read access: Admins only
DROP POLICY IF EXISTS "promotion_redemptions_admin_read" ON public.promotion_redemptions;
CREATE POLICY "promotion_redemptions_admin_read" ON public.promotion_redemptions
  FOR SELECT TO authenticated
  USING (public.is_admin());

GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO authenticated;
GRANT SELECT ON public.promotion_redemptions TO authenticated;

-- 5. SEED INITIAL VERIFIED CAMPAIGNS
INSERT INTO public.promotions (
  id, slug, title, short_description, detailed_description,
  promotion_type, status, is_enabled, start_date, end_date, priority,
  eligible_product_ids, eligible_category,
  gift_product_id, gift_product_name, gift_product_slug, gift_product_image,
  gift_quantity_per_purchase, max_gifts_per_order, gift_stock_quantity, gift_stock_alert_threshold,
  desktop_flyer_url, mobile_flyer_url, flyer_alt_text,
  cta_text, cta_destination, display_order,
  show_on_announcement_bar, announcement_bar_text,
  show_on_homepage_carousel, show_on_offers_page
) VALUES (
  'promo-free-magsafe-case',
  'free-magsafe-case-with-iphone',
  'Free MagSafe Case with iPhone',
  'Buy any eligible iPhone 16 or iPhone 18 series device and receive an authentic Apple MagSafe Case free of charge.',
  'For a limited time, every customer purchasing an eligible iPhone 16 or iPhone 18 series model receives a complimentary Apple MagSafe protective case valued at GH₵ 350. Free gift is automatically added at checkout with physical inspection at our Dome showroom.',
  'free_gift',
  'active',
  true,
  now() - interval '1 day',
  now() + interval '30 days',
  10,
  ARRAY['iphone-16', 'iphone-16-pro', 'iphone-16-pro-max', 'iphone-16-plus', 'iphone-18-pro', 'iphone-18-pro-max'],
  'iPhones',
  'apple-magsafe-iphone-case',
  'Apple iPhone Case with MagSafe',
  'apple-magsafe-iphone-case',
  '/products/campaigns/accessory-magsafe-case.webp',
  1, 1, 50, 5,
  '/products/campaigns/flyer-free-case-desktop.webp',
  '/products/campaigns/flyer-free-case-mobile.webp',
  'Promotional flyer: Buy an eligible iPhone and get an Apple MagSafe Case free',
  'Shop Eligible iPhones',
  '/iphone',
  1,
  true,
  'Buy an eligible iPhone and receive a free Apple MagSafe Case.',
  true,
  true
),
(
  'promo-accessories-10-percent',
  'power-accessories-10-off',
  '10% Off Charging & Power',
  'Save 10% on original Apple 20W, 30W, 70W and MagSafe power adapters.',
  'Equip your Apple devices with original high-speed power adapters and MagSafe chargers. Save 10% automatically when ordering any Charging & Power accessory.',
  'percentage_discount',
  'active',
  true,
  now() - interval '1 day',
  now() + interval '30 days',
  5,
  ARRAY['apple-20w-usb-c-power-adapter', 'apple-30w-usb-c-power-adapter', 'apple-70w-usb-c-power-adapter', 'apple-magsafe-charger'],
  'Accessories',
  null, null, null, null,
  1, 1, 0, 0,
  '/products/campaigns/flyer-accessories-desktop.webp',
  '/products/campaigns/flyer-accessories-mobile.webp',
  'Promotional flyer: 10% off original Apple charging and power adapters',
  'Explore Power Accessories',
  '/accessories',
  2,
  true,
  'Special accessory offer: 10% off authentic Apple power adapters.',
  true,
  true
),
(
  'promo-mac-mini-save-200',
  'save-ghs200-mac-mini',
  'Save GH₵200 on Mac mini',
  'Enjoy an instant GH₵200 discount on Mac mini preorder configurations.',
  'Upgrade your desk setup with serious capability in a compact footprint. Save GH₵200 instantly on eligible Mac mini configurations with genuine Apple guarantee.',
  'fixed_discount',
  'active',
  true,
  now() - interval '1 day',
  now() + interval '30 days',
  5,
  ARRAY['mac-mini'],
  'MacBooks',
  null, null, null, null,
  1, 1, 0, 0,
  '/products/campaigns/flyer-mac-mini-desktop.webp',
  '/products/campaigns/flyer-mac-mini-mobile.webp',
  'Promotional flyer: Save GH₵200 on new Mac mini configurations',
  'Configure Mac mini',
  '/shop/buy-mac/mac-mini',
  3,
  false,
  'Save GH₵200 on Mac mini configurations for a limited time.',
  true,
  true
),
(
  'promo-trade-in-upgrade',
  'trade-in-upgrade-event',
  'Trade In & Upgrade Special',
  'Turn your current iPhone or MacBook into credit toward your next Apple device.',
  'Bring in your pre-owned device to Buy & Sell GH in Dome Pillar 2 for physical diagnostic testing and receive fair value credit toward your next iPhone, iPad or Mac upgrade.',
  'advertising',
  'active',
  true,
  now() - interval '1 day',
  now() + interval '60 days',
  1,
  ARRAY[]::text[],
  'all',
  null, null, null, null,
  1, 1, 0, 0,
  '/products/campaigns/flyer-tradein-desktop.webp',
  '/products/campaigns/flyer-tradein-mobile.webp',
  'Promotional flyer: Trade in your old device and upgrade today',
  'Calculate Trade-In Value',
  '/sell-or-trade',
  4,
  true,
  'Trade in your current device toward your next Apple upgrade in Accra.',
  true,
  true
),
(
  'promo-ps5-slim-combo-offer',
  'one-time-playstation-combo-offer',
  'One-Time PlayStation Combo Offer',
  'Neatly used PS5 Slim Disc Version bundled with brand-new EA Sports FC 25 and two brand-new controllers.',
  'One-Time PlayStation Combo Offer featuring a neatly used PS5 Slim Standard Edition (Disc Version) bundled with a brand-new EA Sports FC 25 game and two brand-new PlayStation controllers. Confirmed availability and complete physical inspection at our Dome showroom in Accra.',
  'bundle',
  'draft',
  false,
  now(),
  now() + interval '60 days',
  8,
  ARRAY['ps5-slim-combo-offer'],
  'Game Consoles',
  null, null, null, null,
  1, 1, 0, 0,
  '/products/campaigns/ps5-slim-combo-desktop.webp',
  '/products/campaigns/ps5-slim-combo-mobile.webp',
  'One-Time PlayStation Combo Offer: PS5 Slim Disc Edition with EA Sports FC 25 and 2 Controllers',
  'Explore PlayStation Bundle',
  '/product/ps5-slim-combo-offer',
  5,
  true,
  'One-Time PlayStation Combo Offer: PS5 Slim + FC 25 + 2 Controllers for GH₵ 7,500.',
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  detailed_description = EXCLUDED.detailed_description,
  promotion_type = EXCLUDED.promotion_type,
  status = EXCLUDED.status,
  is_enabled = EXCLUDED.is_enabled,
  eligible_product_ids = EXCLUDED.eligible_product_ids,
  desktop_flyer_url = EXCLUDED.desktop_flyer_url,
  mobile_flyer_url = EXCLUDED.mobile_flyer_url,
  cta_text = EXCLUDED.cta_text,
  cta_destination = EXCLUDED.cta_destination,
  show_on_announcement_bar = EXCLUDED.show_on_announcement_bar,
  announcement_bar_text = EXCLUDED.announcement_bar_text,
  show_on_homepage_carousel = EXCLUDED.show_on_homepage_carousel,
  show_on_offers_page = EXCLUDED.show_on_offers_page,
  updated_at = now();

-- 6. HARDEN CREATE_ORDER_REQUEST_VALIDATED WITH PROMOTIONS & FREE GIFTS
CREATE OR REPLACE FUNCTION public.create_order_request_validated(
  customer_payload jsonb,
  items_payload jsonb,
  submission_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  client_ip text;
  now_ts timestamptz := clock_timestamp();
  order_row record;
  order_id uuid;
  order_ref text;
  calculated_subtotal numeric(12,2) := 0;
  total_discount numeric(12,2) := 0;
  calculated_total numeric(12,2) := 0;
  product_row record;
  variant_row record;
  promo_row record;
  item_payload jsonb;
  requested_quantity integer;
  selected_storage text;
  selected_colour text;
  resolved_unit_price numeric(12,2);
  line_total numeric(12,2);
  item_discount numeric(12,2) := 0;
  payment_method_value text;
  delivery_method_value text;
  existing_order record;
  applied_promo_id text := null;
  promo_snapshot_data jsonb := null;
  qualifying_product_found boolean := false;
  gift_qty_to_award integer := 0;
  best_discount numeric(12,2) := 0;
BEGIN
  IF coalesce(trim(submission_token), '') = '' THEN
    RAISE EXCEPTION 'Order submission token is required.';
  END IF;

  SELECT * INTO existing_order
  FROM public.orders
  WHERE customer_notes LIKE '%[submission_token:' || submission_token || ']%'
  LIMIT 1;

  IF FOUND THEN
    RETURN public.order_confirmation_json(existing_order.id);
  END IF;

  IF jsonb_typeof(items_payload) <> 'array' OR jsonb_array_length(items_payload) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty. Add at least one product before submitting.';
  END IF;

  payment_method_value := customer_payload ->> 'payment_method';
  delivery_method_value := customer_payload ->> 'fulfilment_type';

  IF coalesce(trim(customer_payload ->> 'full_name'), '') = '' THEN
    RAISE EXCEPTION 'Enter your full name.';
  END IF;
  IF coalesce(trim(customer_payload ->> 'phone'), '') = '' THEN
    RAISE EXCEPTION 'Enter your phone number.';
  END IF;
  IF coalesce(trim(customer_payload ->> 'whatsapp'), '') = '' THEN
    RAISE EXCEPTION 'Enter your WhatsApp number.';
  END IF;
  IF delivery_method_value NOT IN ('pickup', 'delivery') THEN
    RAISE EXCEPTION 'Choose delivery or pickup.';
  END IF;
  IF delivery_method_value = 'delivery' AND coalesce(trim(customer_payload ->> 'delivery_address'), '') = '' THEN
    RAISE EXCEPTION 'Enter the delivery address.';
  END IF;
  IF payment_method_value NOT IN ('Pay on Pickup', 'Mobile Money on Confirmation', 'Bank Transfer on Confirmation') THEN
    RAISE EXCEPTION 'Choose a valid payment preference.';
  END IF;

  -- Phase 1: Validate items and resolve standard pricing
  FOR item_payload IN SELECT * FROM jsonb_array_elements(items_payload)
  LOOP
    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    IF requested_quantity < 1 THEN
      RAISE EXCEPTION 'Choose a valid quantity for each product.';
    END IF;

    SELECT * INTO product_row
    FROM public.products
    WHERE (id = item_payload ->> 'product_id' OR slug = item_payload ->> 'product_slug' OR slug = item_payload ->> 'product_id')
      AND archived = false
      AND available = true
    ORDER BY (id = item_payload ->> 'product_id') DESC, (slug = item_payload ->> 'product_slug') DESC
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is no longer available.';
    END IF;
    IF product_row.stock_status IN ('Sold', 'Out of Stock') OR product_row.stock_quantity < requested_quantity THEN
      RAISE EXCEPTION '% is no longer available in the requested quantity.', product_row.name;
    END IF;

    resolved_unit_price := product_row.price;
    IF (item_payload ->> 'variant_id') IS NOT NULL AND (item_payload ->> 'variant_id') <> '' THEN
      SELECT * INTO variant_row
      FROM public.product_variants
      WHERE (id = item_payload ->> 'variant_id' OR (product_id = product_row.id AND storage = selected_storage AND selected_storage <> ''))
        AND product_id = product_row.id
        AND available = true
      ORDER BY (id = item_payload ->> 'variant_id') DESC, position ASC
      LIMIT 1;
      IF FOUND THEN
        resolved_unit_price := variant_row.price;
      END IF;
    ELSIF selected_storage <> '' THEN
      SELECT * INTO variant_row
      FROM public.product_variants
      WHERE product_id = product_row.id
        AND storage = selected_storage
        AND available = true
      ORDER BY position ASC
      LIMIT 1;
      IF FOUND THEN
        resolved_unit_price := variant_row.price;
      END IF;
    END IF;

    line_total := resolved_unit_price * requested_quantity;
    calculated_subtotal := calculated_subtotal + line_total;
  END LOOP;

  -- Phase 2: Authoritative Promotions Evaluation
  -- Check for active promotions that apply to this cart
  FOR promo_row IN 
    SELECT * FROM public.promotions
    WHERE status = 'active'
      AND is_enabled = true
      AND (start_date IS NULL OR start_date <= now_ts)
      AND (end_date IS NULL OR end_date >= now_ts)
      AND (total_redemption_limit IS NULL OR current_redemptions < total_redemption_limit)
      AND (min_order_subtotal <= calculated_subtotal)
    ORDER BY priority DESC, created_at ASC
  LOOP
    -- A. Free Gift Promotion Evaluation
    IF promo_row.promotion_type = 'free_gift' AND promo_row.gift_stock_quantity > 0 THEN
      qualifying_product_found := false;
      FOR item_payload IN SELECT * FROM jsonb_array_elements(items_payload)
      LOOP
        IF promo_row.eligible_product_ids = '{}' 
           OR (item_payload ->> 'product_id') = ANY(promo_row.eligible_product_ids)
           OR (item_payload ->> 'product_slug') = ANY(promo_row.eligible_product_ids) THEN
          qualifying_product_found := true;
          EXIT;
        END IF;
      END LOOP;

      IF qualifying_product_found THEN
        gift_qty_to_award := least(promo_row.gift_quantity_per_purchase, promo_row.max_gifts_per_order, promo_row.gift_stock_quantity);
        IF gift_qty_to_award > 0 AND applied_promo_id IS NULL THEN
          applied_promo_id := promo_row.id;
          promo_snapshot_data := jsonb_build_object(
            'id', promo_row.id,
            'title', promo_row.title,
            'type', promo_row.promotion_type,
            'gift_product_name', promo_row.gift_product_name,
            'gift_quantity', gift_qty_to_award
          );
        END IF;
      END IF;

    -- B. Percentage Discount Promotion Evaluation
    ELSIF promo_row.promotion_type = 'percentage_discount' AND promo_row.discount_percent > 0 THEN
      best_discount := 0;
      FOR item_payload IN SELECT * FROM jsonb_array_elements(items_payload)
      LOOP
        IF promo_row.eligible_product_ids = '{}' 
           OR (item_payload ->> 'product_id') = ANY(promo_row.eligible_product_ids)
           OR (item_payload ->> 'product_slug') = ANY(promo_row.eligible_product_ids) THEN
          
          requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
          -- Compute line discount
          SELECT price INTO resolved_unit_price FROM public.products WHERE id = item_payload ->> 'product_id' OR slug = item_payload ->> 'product_slug' LIMIT 1;
          item_discount := round((resolved_unit_price * (promo_row.discount_percent / 100.0)), 2) * requested_quantity;
          best_discount := best_discount + item_discount;
        END IF;
      END LOOP;

      IF best_discount > total_discount AND (applied_promo_id IS NULL OR promo_row.allow_stacking) THEN
        total_discount := best_discount;
        applied_promo_id := promo_row.id;
        promo_snapshot_data := jsonb_build_object(
          'id', promo_row.id,
          'title', promo_row.title,
          'type', promo_row.promotion_type,
          'discount_percent', promo_row.discount_percent,
          'discount_amount', total_discount
        );
      END IF;

    -- C. Fixed Discount Promotion Evaluation
    ELSIF promo_row.promotion_type = 'fixed_discount' AND promo_row.discount_amount > 0 THEN
      qualifying_product_found := false;
      FOR item_payload IN SELECT * FROM jsonb_array_elements(items_payload)
      LOOP
        IF promo_row.eligible_product_ids = '{}' 
           OR (item_payload ->> 'product_id') = ANY(promo_row.eligible_product_ids)
           OR (item_payload ->> 'product_slug') = ANY(promo_row.eligible_product_ids) THEN
          qualifying_product_found := true;
          EXIT;
        END IF;
      END LOOP;

      IF qualifying_product_found AND promo_row.discount_amount > total_discount AND (applied_promo_id IS NULL OR promo_row.allow_stacking) THEN
        total_discount := least(promo_row.discount_amount, calculated_subtotal);
        applied_promo_id := promo_row.id;
        promo_snapshot_data := jsonb_build_object(
          'id', promo_row.id,
          'title', promo_row.title,
          'type', promo_row.promotion_type,
          'discount_amount', total_discount
        );
      END IF;
    END IF;

    -- Unless stacking is allowed, stop after best primary promotion
    IF applied_promo_id IS NOT NULL AND NOT promo_row.allow_stacking THEN
      EXIT;
    END IF;
  END LOOP;

  calculated_total := greatest(0, calculated_subtotal - total_discount);
  order_ref := public.generate_order_reference();

  -- Phase 3: Insert Order
  INSERT INTO public.orders (
    reference_number,
    customer_name,
    customer_phone,
    customer_whatsapp,
    customer_email,
    delivery_method,
    delivery_address,
    region,
    city,
    landmark,
    customer_notes,
    subtotal,
    discount_amount,
    delivery_fee,
    total_amount,
    payment_method,
    payment_status,
    order_status,
    applied_promotion_id,
    promotion_snapshot
  ) VALUES (
    order_ref,
    trim(customer_payload ->> 'full_name'),
    trim(customer_payload ->> 'phone'),
    trim(customer_payload ->> 'whatsapp'),
    nullif(trim(customer_payload ->> 'email'), ''),
    delivery_method_value,
    nullif(trim(customer_payload ->> 'delivery_address'), ''),
    nullif(trim(customer_payload ->> 'region'), ''),
    nullif(trim(customer_payload ->> 'city'), ''),
    nullif(trim(customer_payload ->> 'landmark'), ''),
    concat_ws(
      E'\n\n',
      nullif(trim(customer_payload ->> 'delivery_notes'), ''),
      nullif(trim(customer_payload ->> 'additional_note'), ''),
      '[submission_token:' || submission_token || ']'
    ),
    calculated_subtotal,
    total_discount,
    null,
    calculated_total,
    payment_method_value,
    'Unpaid',
    'Pending',
    applied_promo_id,
    promo_snapshot_data
  )
  RETURNING id INTO order_id;

  -- Phase 4: Insert Standard Order Items
  FOR item_payload IN SELECT * FROM jsonb_array_elements(items_payload)
  LOOP
    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    SELECT * INTO product_row
    FROM public.products
    WHERE (id = item_payload ->> 'product_id' OR slug = item_payload ->> 'product_slug' OR slug = item_payload ->> 'product_id')
      AND archived = false
      AND available = true
    ORDER BY (id = item_payload ->> 'product_id') DESC, (slug = item_payload ->> 'product_slug') DESC
    LIMIT 1;

    resolved_unit_price := product_row.price;
    IF (item_payload ->> 'variant_id') IS NOT NULL AND (item_payload ->> 'variant_id') <> '' THEN
      SELECT * INTO variant_row
      FROM public.product_variants
      WHERE (id = item_payload ->> 'variant_id' OR (product_id = product_row.id AND storage = selected_storage AND selected_storage <> ''))
        AND product_id = product_row.id
        AND available = true
      ORDER BY (id = item_payload ->> 'variant_id') DESC, position ASC
      LIMIT 1;
      IF FOUND THEN
        resolved_unit_price := variant_row.price;
      END IF;
    ELSIF selected_storage <> '' THEN
      SELECT * INTO variant_row
      FROM public.product_variants
      WHERE product_id = product_row.id
        AND storage = selected_storage
        AND available = true
      ORDER BY position ASC
      LIMIT 1;
      IF FOUND THEN
        resolved_unit_price := variant_row.price;
      END IF;
    END IF;

    line_total := resolved_unit_price * requested_quantity;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      product_image,
      quantity,
      unit_price,
      selected_storage,
      selected_colour,
      selected_condition,
      line_total,
      is_free_gift,
      applied_promotion_id
    ) VALUES (
      order_id,
      product_row.id,
      product_row.name,
      product_row.slug,
      coalesce(nullif(product_row.images -> 0 ->> 'src', ''), ''),
      requested_quantity,
      resolved_unit_price,
      selected_storage,
      selected_colour,
      product_row.condition,
      line_total,
      false,
      applied_promo_id
    );
  END LOOP;

  -- Phase 5: Insert Promotional Free Gift Item If Applicable
  IF gift_qty_to_award > 0 AND applied_promo_id IS NOT NULL THEN
    SELECT * INTO promo_row FROM public.promotions WHERE id = applied_promo_id;
    IF FOUND AND promo_row.promotion_type = 'free_gift' THEN
      INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        product_slug,
        product_image,
        quantity,
        unit_price,
        selected_storage,
        selected_colour,
        selected_condition,
        line_total,
        is_free_gift,
        applied_promotion_id
      ) VALUES (
        order_id,
        promo_row.gift_product_id,
        coalesce(promo_row.gift_product_name, 'Promotional Free Gift'),
        coalesce(promo_row.gift_product_slug, 'free-gift'),
        coalesce(promo_row.gift_product_image, ''),
        gift_qty_to_award,
        0.00,
        'Standard',
        'Standard',
        'Brand New',
        0.00,
        true,
        applied_promo_id
      );

      -- Deduct promotional gift stock safely
      UPDATE public.promotions
      SET gift_stock_quantity = greatest(0, gift_stock_quantity - gift_qty_to_award),
          total_gifts_allocated = total_gifts_allocated + gift_qty_to_award
      WHERE id = applied_promo_id;
    END IF;
  END IF;

  -- Phase 6: Record Redemption Audit & Increment Performance Counters
  IF applied_promo_id IS NOT NULL THEN
    INSERT INTO public.promotion_redemptions (
      promotion_id,
      order_id,
      order_reference,
      customer_phone,
      customer_email,
      discount_amount,
      gift_product_id,
      gift_quantity
    ) VALUES (
      applied_promo_id,
      order_id,
      order_ref,
      trim(customer_payload ->> 'phone'),
      nullif(trim(customer_payload ->> 'email'), ''),
      total_discount,
      promo_row.gift_product_id,
      gift_qty_to_award
    );

    UPDATE public.promotions
    SET current_redemptions = current_redemptions + 1,
        orders_count = orders_count + 1,
        total_discount_given = total_discount_given + total_discount,
        total_attributed_sales = total_attributed_sales + calculated_total,
        updated_at = now()
    WHERE id = applied_promo_id;
  END IF;

  RETURN public.order_confirmation_json(order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_order_request_validated(jsonb, jsonb, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_request_validated(jsonb, jsonb, text) TO authenticated;

COMMIT;

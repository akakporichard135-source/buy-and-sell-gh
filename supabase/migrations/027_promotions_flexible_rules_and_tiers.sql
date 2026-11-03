-- ==============================================================================
-- Migration 027: Promotions Flexible Rules, Tiers, Exclusions & Media Extensions
-- ==============================================================================
-- 1. Adds tiered discount rules (e.g. 10% on GH₵2k-4k, 15% on >GH₵4k)
-- 2. Adds product-specific, variant-specific and category-specific overrides
-- 3. Adds minimum qualifying item price threshold (e.g. > GH₵ 2,000)
-- 4. Adds exclusions for products and categories
-- 5. Adds maximum discount amount caps
-- 6. Adds additional promotional media and image positioning
-- 7. Seed Mega Discount Sale default campaign
--
-- Idempotent: safe to run multiple times without error.

BEGIN;

-- 1. ADD NEW COLUMNS TO PUBLIC.PROMOTIONS
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS min_qualifying_item_price numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_discount_amount numeric(12,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS discount_calculation_mode text DEFAULT 'single_percent',
  ADD COLUMN IF NOT EXISTS discount_tiers jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS product_discounts jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS variant_discounts jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category_discounts jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_product_ids text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_position text DEFAULT 'center';

-- 2. SEED OR UPDATE MEGA DISCOUNT SALE CAMPAIGN
INSERT INTO public.promotions (
  id,
  slug,
  title,
  short_description,
  detailed_description,
  promotion_type,
  status,
  is_enabled,
  start_date,
  end_date,
  timezone,
  priority,
  allow_stacking,
  eligible_product_ids,
  eligible_category,
  min_order_subtotal,
  min_qualifying_item_price,
  discount_calculation_mode,
  discount_tiers,
  discount_percent,
  desktop_flyer_url,
  mobile_flyer_url,
  flyer_alt_text,
  cta_text,
  cta_destination,
  display_order,
  show_on_announcement_bar,
  announcement_bar_text,
  show_on_homepage_carousel,
  show_on_offers_page,
  customer_redemption_limit,
  created_by,
  created_at,
  updated_at
) VALUES (
  'promo-mega-discount-sale',
  'mega-discount-sale-up-to-15-off',
  'Mega Discount Sale — Up to 15% Off',
  'Save 10% to 15% on qualifying premium Apple devices priced above GH₵ 2,000.',
  'Save between 10% and 15% on qualifying devices priced over GH₵ 2,000. Enjoy 10% discount on devices from GH₵ 2,000 to GH₵ 4,000, and 15% discount on devices above GH₵ 4,000. Verified directly at checkout.',
  'percentage_discount',
  'active',
  true,
  '2026-11-01T00:00:00Z',
  '2026-12-31T23:59:59Z',
  'Africa/Accra',
  8,
  false,
  '{}',
  'all',
  0,
  2000,
  'price_tiers',
  '[{"minPrice": 2000, "maxPrice": 4000, "percent": 10, "label": "GH₵ 2,000 - GH₵ 4,000 (10% Off)"}, {"minPrice": 4001, "maxPrice": null, "percent": 15, "label": "GH₵ 4,001 and above (15% Off)"}]'::jsonb,
  15,
  '/products/campaigns/flyer-mega-discount-desktop.webp',
  '/products/campaigns/flyer-mega-discount-mobile.webp',
  'Promotional flyer: Mega Discount Sale — Up to 15% off qualifying devices above GH₵ 2,000',
  'Shop Qualifying Devices',
  '/store',
  2,
  true,
  'Mega Discount Sale: Save 10% to 15% on devices priced above GH₵ 2,000.',
  true,
  true,
  1,
  'admin',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  min_qualifying_item_price = EXCLUDED.min_qualifying_item_price,
  discount_calculation_mode = EXCLUDED.discount_calculation_mode,
  discount_tiers = EXCLUDED.discount_tiers,
  updated_at = now();

COMMIT;

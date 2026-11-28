-- ============================================================================
-- Migration 030: Classify iPhone 15 Pro Generation & Older Under UK Used
-- ============================================================================
-- Owner inventory rule:
--   Every iPhone model from the iPhone 15 Pro generation downwards must be
--   classified and displayed under UK Used while preserving original product IDs,
--   slugs, prices, stock quantities, variants, images, and order relationships.
--
-- Affected records audited on live Supabase:
--   iphone-15-pro-max, iphone-15-pro, iphone-15-plus, iphone-14-pro-max,
--   iphone-14-pro, iphone-14-plus, iphone-14, iphone-13-pro-max,
--   iphone-13-pro, iphone-13, iphone-13-mini, iphone-12-pro-max,
--   iphone-12, iphone-12-mini
--   (iphone-15, iphone-12-pro, and iphone-11-pro-max already hold used grades)
--
-- Safe & idempotent: updates condition ONLY where currently 'Brand New' or 'To Confirm'.
-- Does NOT touch Brand New iPhone 16 / 17 / Air / 18 / Duo records or any images.
-- ============================================================================

UPDATE public.products
SET
  condition = 'UK Used',
  updated_at = NOW()
WHERE
  archived = FALSE
  AND slug IN (
    'iphone-15-pro-max',
    'iphone-15-pro',
    'iphone-15-plus',
    'iphone-15',
    'iphone-14-pro-max',
    'iphone-14-pro',
    'iphone-14-plus',
    'iphone-14',
    'iphone-13-pro-max',
    'iphone-13-pro',
    'iphone-13',
    'iphone-13-mini',
    'iphone-12-pro-max',
    'iphone-12-pro',
    'iphone-12',
    'iphone-12-mini',
    'iphone-11-pro-max',
    'iphone-11-pro',
    'iphone-11'
  )
  AND condition IN ('Brand New', 'To Confirm');

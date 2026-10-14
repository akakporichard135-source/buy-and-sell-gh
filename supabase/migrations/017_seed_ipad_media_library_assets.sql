-- Migration 017: Seed iPad Storefront and Catalogue Media Assets into media_library
-- Target Project: kgbcytxhyqalzawkdghn (Buy & Sell GH Production)

BEGIN;

INSERT INTO public.media_library (
  id,
  title,
  filename,
  url,
  storage_path,
  file_size,
  mime_type,
  category,
  alt,
  fit,
  position,
  created_at,
  updated_at
)
VALUES
  -- 1. iPad Air Promo Tile (Storefront Filter)
  (
    'media-tile-ipad-air',
    'iPad Air Promo Tile',
    'homepage-ipad-air-white.webp',
    '/products/homepage/homepage-ipad-air-white.webp',
    NULL,
    75592,
    'image/webp',
    'storefront',
    'iPad Air front and back in light finishes',
    'contain',
    'center',
    now(),
    now()
  ),
  -- 2. iPad Air Finish Lineup (Product Imagery Filter)
  (
    'media-product-ipad-air-colors',
    'iPad Air Finish Lineup',
    'ipad-air-colors.webp',
    '/products/campaigns/ipad-air-colors.webp',
    NULL,
    19206,
    'image/webp',
    'product',
    'iPad Air multi-color lineup',
    'contain',
    'center',
    now(),
    now()
  ),
  -- 3. iPad Air Blue Device (Product Imagery Filter)
  (
    'media-product-ipad-air-blue',
    'iPad Air Blue Device',
    'ipad-air-blue.webp',
    '/products/campaigns/ipad-air-blue.webp',
    NULL,
    48514,
    'image/webp',
    'product',
    'iPad Air in blue finish',
    'contain',
    'center',
    now(),
    now()
  ),
  -- 4. iPad Air Studio White (Product Imagery Filter)
  (
    'media-product-ipad-air-white',
    'iPad Air Studio White',
    'homepage-ipad-air-white.webp',
    '/products/homepage/homepage-ipad-air-white.webp',
    NULL,
    75592,
    'image/webp',
    'product',
    'iPad Air front and back in light finishes',
    'contain',
    'center',
    now(),
    now()
  ),
  -- 5. iPad Pro 13-inch (Product Imagery Filter)
  (
    'media-product-ipad-pro-13',
    'iPad Pro 13-inch',
    'ipad-pro-13.webp',
    '/products/campaigns/ipad-pro-13.webp',
    NULL,
    35314,
    'image/webp',
    'product',
    'iPad Pro 13-inch Ultra Retina XDR display',
    'contain',
    'center',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  filename = EXCLUDED.filename,
  category = EXCLUDED.category,
  alt = EXCLUDED.alt,
  fit = EXCLUDED.fit,
  position = EXCLUDED.position,
  updated_at = now()
WHERE public.media_library.storage_path IS NULL;

COMMIT;

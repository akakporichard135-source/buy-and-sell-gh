-- ==============================================================================
-- Rollback Migration 016: Site Content Management, Media Library, and Storefront CMS
-- ==============================================================================
-- Safely drop newly created CMS tables if rollback is ever required.
-- This rollback does NOT touch products, product_variants, orders, order_items,
-- admin_profiles, customers, mfa_factors, or any existing database tables.

BEGIN;

DROP TABLE IF EXISTS public.storefront_content CASCADE;
DROP TABLE IF EXISTS public.page_content CASCADE;
DROP TABLE IF EXISTS public.site_faqs CASCADE;
DROP TABLE IF EXISTS public.media_library CASCADE;
DROP TABLE IF EXISTS public.homepage_content CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;

-- Safe rollback of storage policies to baseline
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

COMMIT;

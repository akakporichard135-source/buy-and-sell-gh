-- ==============================================================================
-- Migration 016: Site Content Management, Media Library, and Storefront CMS
-- ==============================================================================
-- Complete administrative control for Buy & Sell GH:
-- 1. Site Settings (business identity, contacts, announcements, policies)
-- 2. Homepage Content (heroes, promo tiles, service flyers, badges)
-- 3. Media Library (image registry, filenames, urls, categories, alt text)
-- 4. Site FAQs (manageable questions & answers)
-- 5. Page Content (About Us, Repairs, Trade-In & Upgrade copy)
-- 6. Storefront Content (Department intros, featured cards, showcase collections)
--
-- Security model:
-- - Public read access for customer-facing display
-- - media_library table restricted to authenticated admins only (images served via public Storage URLs)
-- - site_faqs public read restricted to enabled = true (drafts protected)
-- - Strict AAL2 TOTP MFA + public.is_admin() for all mutations
-- - Idempotent: Safe to execute or rerun at any time without error

BEGIN;

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'global',
  settings jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "site_settings_admin_all" ON public.site_settings;
CREATE POLICY "site_settings_admin_all" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO authenticated;


-- 2. Homepage Content
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id text PRIMARY KEY DEFAULT 'main',
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_content_public_read" ON public.homepage_content;
CREATE POLICY "homepage_content_public_read" ON public.homepage_content
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "homepage_content_admin_all" ON public.homepage_content;
CREATE POLICY "homepage_content_admin_all" ON public.homepage_content
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

GRANT SELECT ON public.homepage_content TO anon, authenticated;
GRANT ALL ON public.homepage_content TO authenticated;


-- 3. Media Library (Internal asset metadata registry)
-- Note: Storefront visitors access assets via public CDN URLs from Storage.
-- The metadata table itself is restricted to authenticated AAL2 administrators.
CREATE TABLE IF NOT EXISTS public.media_library (
  id text PRIMARY KEY,
  title text NOT NULL,
  filename text NOT NULL,
  url text NOT NULL,
  storage_path text,
  file_size bigint,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  category text NOT NULL DEFAULT 'other',
  alt text DEFAULT '',
  fit text DEFAULT 'cover',
  position text DEFAULT 'center',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_library_public_read" ON public.media_library;
DROP POLICY IF EXISTS "media_library_admin_all" ON public.media_library;
CREATE POLICY "media_library_admin_all" ON public.media_library
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

REVOKE ALL ON public.media_library FROM anon, public;
GRANT ALL ON public.media_library TO authenticated;


-- 4. Site FAQs (Draft Protection: Public visitors can only view enabled FAQs)
CREATE TABLE IF NOT EXISTS public.site_faqs (
  id text PRIMARY KEY,
  q text NOT NULL,
  a text NOT NULL,
  category text DEFAULT 'general',
  "order" integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_faqs_public_read" ON public.site_faqs;
CREATE POLICY "site_faqs_public_read" ON public.site_faqs
  FOR SELECT TO anon, authenticated
  USING (enabled = true);

DROP POLICY IF EXISTS "site_faqs_admin_drafts" ON public.site_faqs;
CREATE POLICY "site_faqs_admin_drafts" ON public.site_faqs
  FOR SELECT TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

DROP POLICY IF EXISTS "site_faqs_admin_all" ON public.site_faqs;
CREATE POLICY "site_faqs_admin_all" ON public.site_faqs
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

GRANT SELECT ON public.site_faqs TO anon, authenticated;
GRANT ALL ON public.site_faqs TO authenticated;


-- 5. Page Content (About Us, Repairs, Trade-In)
CREATE TABLE IF NOT EXISTS public.page_content (
  id text PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "page_content_public_read" ON public.page_content;
CREATE POLICY "page_content_public_read" ON public.page_content
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "page_content_admin_all" ON public.page_content;
CREATE POLICY "page_content_admin_all" ON public.page_content
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

GRANT SELECT ON public.page_content TO anon, authenticated;
GRANT ALL ON public.page_content TO authenticated;


-- 6. Storefront Content (Category Departments & Featured Showcase Cards)
CREATE TABLE IF NOT EXISTS public.storefront_content (
  key text PRIMARY KEY,
  config jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.storefront_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "storefront_content_public_read" ON public.storefront_content;
CREATE POLICY "storefront_content_public_read" ON public.storefront_content
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "storefront_content_admin_all" ON public.storefront_content;
CREATE POLICY "storefront_content_admin_all" ON public.storefront_content
  FOR ALL TO authenticated
  USING (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'))
  WITH CHECK (public.is_admin() AND (auth.jwt() ->> 'aal' = 'aal2'));

GRANT SELECT ON public.storefront_content TO anon, authenticated;
GRANT ALL ON public.storefront_content TO authenticated;


-- 7. Supabase Storage Bucket & Policies (product-images bucket used by Media Library)
-- Preserves existing bucket configuration if already present; creates if missing.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (auth.jwt() ->> 'aal' = 'aal2')
  );

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (auth.jwt() ->> 'aal' = 'aal2')
  )
  WITH CHECK (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (auth.jwt() ->> 'aal' = 'aal2')
  );

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND public.is_admin()
    AND (auth.jwt() ->> 'aal' = 'aal2')
  );

COMMIT;

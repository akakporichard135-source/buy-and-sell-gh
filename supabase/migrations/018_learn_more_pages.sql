-- Learn More publishing keeps drafts separate from public content.
BEGIN;

CREATE TABLE IF NOT EXISTS public.learn_more_published (
  id text PRIMARY KEY,
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learn_more_drafts (
  id text PRIMARY KEY,
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learn_more_published ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_more_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS learn_more_public_read ON public.learn_more_published;
CREATE POLICY learn_more_public_read ON public.learn_more_published
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS learn_more_admin_write ON public.learn_more_published;
CREATE POLICY learn_more_admin_write ON public.learn_more_published
  FOR ALL TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2')
  WITH CHECK (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS learn_more_draft_admin ON public.learn_more_drafts;
CREATE POLICY learn_more_draft_admin ON public.learn_more_drafts
  FOR ALL TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2')
  WITH CHECK (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

REVOKE ALL ON public.learn_more_published FROM anon, public;
REVOKE ALL ON public.learn_more_drafts FROM anon, public;
GRANT SELECT ON public.learn_more_published TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.learn_more_published TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learn_more_drafts TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'learn-more-media', 'learn-more-media', true, 209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS learn_more_media_admin_insert ON storage.objects;
DROP POLICY IF EXISTS learn_more_media_admin_select ON storage.objects;
CREATE POLICY learn_more_media_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'learn-more-media' AND public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

CREATE POLICY learn_more_media_admin_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'learn-more-media'
    AND public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2'
  );

DROP POLICY IF EXISTS learn_more_media_admin_update ON storage.objects;
CREATE POLICY learn_more_media_admin_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'learn-more-media' AND public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2')
  WITH CHECK (bucket_id = 'learn-more-media' AND public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS learn_more_media_admin_delete ON storage.objects;
CREATE POLICY learn_more_media_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'learn-more-media' AND public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

COMMIT;

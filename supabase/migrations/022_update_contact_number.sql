-- ==============================================================================
-- Migration 022: Update Contact Phone & WhatsApp Numbers to 0551975451
-- ==============================================================================
BEGIN;

UPDATE public.site_settings
SET settings = jsonb_set(
  jsonb_set(
    jsonb_set(settings, '{whatsapp,primary}', '"233551975451"'),
    '{whatsapp,secondary}', '"233551975451"'
  ),
  '{phones}', '["055 197 5451"]'::jsonb
),
updated_at = now()
WHERE id = 'global';

COMMIT;

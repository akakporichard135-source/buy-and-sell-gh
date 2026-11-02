-- Service enquiries are private. Anonymous visitors may only call the validated submit RPC.
CREATE SEQUENCE IF NOT EXISTS public.service_request_reference_seq;

CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  service_type text NOT NULL CHECK (service_type IN (
    'installment', 'repair', 'trade-in', 'upgrade', 'visa-card',
    'pre-order', 'referral', 'contact'
  )),
  customer_name text NOT NULL,
  phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Review', 'Contacted', 'Completed', 'Closed')),
  admin_notes text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'Website Form',
  idempotency_key uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS service_requests_created_at_idx ON public.service_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_type_status_idx ON public.service_requests (service_type, status);
CREATE INDEX IF NOT EXISTS service_requests_phone_created_idx ON public.service_requests (phone, created_at DESC);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.service_requests FROM PUBLIC, anon;
REVOKE ALL ON SEQUENCE public.service_request_reference_seq FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.service_requests TO authenticated;

DROP POLICY IF EXISTS service_requests_admin_select ON public.service_requests;
CREATE POLICY service_requests_admin_select ON public.service_requests
  FOR SELECT TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS service_requests_admin_insert ON public.service_requests;
CREATE POLICY service_requests_admin_insert ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

DROP POLICY IF EXISTS service_requests_admin_update ON public.service_requests;
CREATE POLICY service_requests_admin_update ON public.service_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2')
  WITH CHECK (public.is_admin() AND auth.jwt() ->> 'aal' = 'aal2');

CREATE OR REPLACE FUNCTION public.submit_service_request(
  p_type text,
  p_name text,
  p_phone text,
  p_details jsonb,
  p_idempotency_key uuid,
  p_honeypot text DEFAULT ''
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '[[:space:]()-]', '', 'g');
  v_details jsonb := coalesce(p_details, '{}'::jsonb);
  v_key text;
  v_value jsonb;
  v_existing public.service_requests%ROWTYPE;
  v_reference text;
BEGIN
  IF coalesce(p_honeypot, '') <> '' THEN
    RAISE EXCEPTION 'Request could not be submitted.' USING ERRCODE = 'P0001';
  END IF;
  IF p_type NOT IN ('installment', 'repair', 'trade-in', 'upgrade', 'visa-card', 'pre-order', 'referral', 'contact')
    OR length(v_name) NOT BETWEEN 2 AND 120
    OR v_phone !~ '^\+?[0-9]{9,15}$'
    OR p_idempotency_key IS NULL
    OR jsonb_typeof(v_details) <> 'object'
    OR length(v_details::text) > 8000
    OR (SELECT count(*) FROM jsonb_object_keys(v_details)) > 32 THEN
    RAISE EXCEPTION 'Check the required request fields and try again.' USING ERRCODE = '22023';
  END IF;

  FOR v_key, v_value IN SELECT key, value FROM jsonb_each(v_details) LOOP
    IF v_key !~ '^[A-Za-z][A-Za-z0-9]{0,39}$'
      OR v_key ~* '(pin|password|cvv|cardnumber)'
      OR jsonb_typeof(v_value) <> 'string'
      OR length(v_value #>> '{}') > 2000 THEN
      RAISE EXCEPTION 'Request contains an unsupported field.' USING ERRCODE = '22023';
    END IF;
  END LOOP;

  IF (p_type = 'installment' AND (coalesce(v_details->>'model', '') = ''
      OR coalesce(v_details->>'ghanaCard', '') NOT IN ('Yes', 'No', 'Need guidance')
      OR coalesce(v_details->>'planDuration', '') NOT IN ('2 weeks', '4 weeks', '6 weeks', '8 weeks', '12 weeks', 'Other / Discuss with team')
      OR coalesce(v_details->>'paymentFrequency', '') NOT IN ('Weekly', 'Every 2 weeks', 'Discuss with team')
      OR coalesce(v_details->>'depositPreference', '') NOT IN ('Yes', 'No', 'Discuss with team')))
    OR (p_type = 'repair' AND (coalesce(v_details->>'model', '') = '' OR coalesce(v_details->>'issue', '') = ''))
    OR (p_type IN ('trade-in', 'upgrade') AND (coalesce(v_details->>'brand', '') = '' OR coalesce(v_details->>'model', '') = ''))
    OR (p_type = 'visa-card' AND (coalesce(v_details->>'cardType', '') = '' OR coalesce(v_details->>'cardValue', '') = ''))
    OR (p_type = 'pre-order' AND (coalesce(v_details->>'model', '') = '' OR coalesce(v_details->>'budget', '') = ''))
    OR (p_type = 'referral' AND (coalesce(v_details->>'friendName', '') = '' OR coalesce(v_details->>'friendPhone', '') = '' OR coalesce(v_details->>'interest', '') = ''))
    OR (p_type = 'contact' AND coalesce(v_details->>'message', '') = '') THEN
    RAISE EXCEPTION 'Complete the required service details before submitting.' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_idempotency_key::text)::bigint);
  SELECT * INTO v_existing FROM public.service_requests WHERE idempotency_key = p_idempotency_key;
  IF FOUND THEN
    IF v_existing.phone = v_phone AND v_existing.service_type = p_type
      AND v_existing.customer_name = v_name AND v_existing.details = v_details THEN
      RETURN v_existing.reference;
    END IF;
    RAISE EXCEPTION 'This request changed. Please submit it again.' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_phone)::bigint);
  IF (SELECT count(*) FROM public.service_requests
      WHERE phone = v_phone AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Too many requests. Please try again later.' USING ERRCODE = 'P0001';
  END IF;

  v_reference := 'BSG-SR-' || lpad(nextval('public.service_request_reference_seq')::text, 7, '0');
  INSERT INTO public.service_requests (reference, service_type, customer_name, phone, details, idempotency_key)
  VALUES (v_reference, p_type, v_name, v_phone, v_details, p_idempotency_key);
  RETURN v_reference;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_service_request(text, text, text, jsonb, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_service_request(text, text, text, jsonb, uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_service_requests()
RETURNS TABLE (
  id uuid,
  reference text,
  service_type text,
  customer_name text,
  phone text,
  details jsonb,
  status text,
  admin_notes text,
  source text,
  created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT sr.id, sr.reference, sr.service_type, sr.customer_name, sr.phone, sr.details, sr.status, sr.admin_notes, sr.source, sr.created_at
  FROM public.service_requests sr
  ORDER BY sr.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_service_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_service_requests() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_service_request(
  p_id uuid,
  p_status text DEFAULT NULL,
  p_admin_notes text DEFAULT NULL
)
RETURNS SETOF public.service_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.service_requests
  SET
    status = COALESCE(p_status, status),
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    updated_at = now()
  WHERE id = p_id
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_service_request(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_service_request(uuid, text, text) TO anon, authenticated;

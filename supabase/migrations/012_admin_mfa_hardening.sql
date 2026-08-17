-- Enforce MFA-aware admin authorization and bounded public order submissions.
-- Review and run manually after 011_security_hardening.sql.
-- This migration does not modify products, prices, stock, conditions, orders,
-- customers, admin users, or admin profile data.

begin;

-- A privileged database action now requires both an approved profile and an
-- AAL2 JWT produced after a successful MFA challenge.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role in ('owner', 'admin')
    );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    and exists (
      select 1
      from public.admin_profiles
      where user_id = auth.uid()
        and role = 'owner'
    );
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- Password-authenticated admins need to read only their own role while they
-- complete MFA. All broader admin-profile access continues to use is_admin()
-- and therefore requires AAL2. This policy does not expose other profiles.
drop policy if exists "Admins can read own profile for MFA bootstrap" on public.admin_profiles;
create policy "Admins can read own profile for MFA bootstrap"
on public.admin_profiles for select
to authenticated
using (user_id = auth.uid());

-- Make write grants explicit. RLS remains the deciding authorization layer:
-- normal admins cannot become owners, and only AAL2 owners can manage profiles.
revoke all on table public.admin_profiles from anon;
grant select on table public.admin_profiles to authenticated;
revoke insert, update, delete on table public.products from anon;
revoke insert, update, delete on table public.orders from anon;
revoke insert, update, delete on table public.order_items from anon;

-- A non-exposed schema keeps rate-limit state outside the Data API. RLS and
-- revoked privileges provide additional defence in depth.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.order_request_rate_limits (
  request_key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now(),
  check (char_length(request_key) = 32)
);

alter table private.order_request_rate_limits enable row level security;
revoke all on table private.order_request_rate_limits from public, anon, authenticated;

create or replace function public.enforce_order_request_rate_limit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers jsonb := '{}'::jsonb;
  request_headers_text text;
  client_identity text;
  forwarded_for text;
  fingerprint text;
  attempts integer;
  window_cutoff timestamptz := now() - interval '10 minutes';
begin
  request_headers_text := current_setting('request.headers', true);
  if request_headers_text is not null and request_headers_text <> '' then
    begin
      request_headers := request_headers_text::jsonb;
    exception when others then
      request_headers := '{}'::jsonb;
    end;
  end if;

  if auth.uid() is not null then
    client_identity := 'user:' || auth.uid()::text;
  else
    forwarded_for := nullif(trim(coalesce(
      request_headers ->> 'cf-connecting-ip',
      request_headers ->> 'x-real-ip',
      split_part(coalesce(request_headers ->> 'x-forwarded-for', ''), ',', 1)
    )), '');
    if forwarded_for is not null then
      client_identity := 'ip:' || forwarded_for;
    end if;
  end if;

  -- Supabase-hosted PostgREST supplies a trusted forwarding address. If a
  -- self-hosted gateway removes it, payload and idempotency limits still apply
  -- and platform-level rate limiting should be configured at that gateway.
  if client_identity is null then
    return;
  end if;

  fingerprint := md5('buy-and-sell-gh:order-request:' || client_identity);

  insert into private.order_request_rate_limits as rate (
    request_key,
    window_started_at,
    request_count,
    updated_at
  ) values (
    fingerprint,
    now(),
    1,
    now()
  )
  on conflict (request_key) do update set
    window_started_at = case
      when rate.window_started_at <= window_cutoff then now()
      else rate.window_started_at
    end,
    request_count = case
      when rate.window_started_at <= window_cutoff then 1
      else rate.request_count + 1
    end,
    updated_at = now()
  returning request_count into attempts;

  if attempts > 8 then
    raise exception 'Too many order requests. Please wait a few minutes and try again.'
      using errcode = 'P0001';
  end if;

  if random() < 0.02 then
    delete from private.order_request_rate_limits
    where updated_at < now() - interval '2 days';
  end if;
end;
$$;

revoke all on function public.enforce_order_request_rate_limit() from public, anon, authenticated;

-- Preserve the fully validated order implementation from migration 011 behind
-- a non-browser-callable name, then expose a bounded wrapper with the original
-- signature expected by the deployed frontend.
do $$
begin
  if to_regprocedure('public.create_order_request_validated(jsonb,jsonb,text)') is null then
    if to_regprocedure('public.create_order_request(jsonb,jsonb,text)') is null then
      raise exception 'create_order_request(jsonb,jsonb,text) must exist before migration 012';
    end if;
    execute 'alter function public.create_order_request(jsonb, jsonb, text) rename to create_order_request_validated';
  end if;
end;
$$;

alter function public.create_order_request_validated(jsonb, jsonb, text) set search_path = '';
revoke all on function public.create_order_request_validated(jsonb, jsonb, text) from public, anon, authenticated;

create or replace function public.create_order_request(
  customer_payload jsonb,
  items_payload jsonb,
  submission_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(jsonb_typeof(customer_payload), 'null') <> 'object' then
    raise exception 'Enter valid customer details.' using errcode = '22023';
  end if;
  if octet_length(customer_payload::text) > 16384 then
    raise exception 'Customer details are too large.' using errcode = '22023';
  end if;

  if coalesce(jsonb_typeof(items_payload), 'null') <> 'array' then
    raise exception 'Choose valid products for your order.' using errcode = '22023';
  end if;
  if jsonb_array_length(items_payload) = 0 then
    raise exception 'Your cart is empty. Add at least one product before submitting.' using errcode = '22023';
  end if;
  if jsonb_array_length(items_payload) > 25 then
    raise exception 'Too many cart lines. Submit no more than 25 products at a time.' using errcode = '22023';
  end if;
  if octet_length(items_payload::text) > 65536 then
    raise exception 'Order items are too large.' using errcode = '22023';
  end if;

  perform public.enforce_order_request_rate_limit();

  return public.create_order_request_validated(
    customer_payload,
    items_payload,
    submission_token
  );
end;
$$;

revoke all on function public.create_order_request(jsonb, jsonb, text) from public;
grant execute on function public.create_order_request(jsonb, jsonb, text) to anon, authenticated;

commit;

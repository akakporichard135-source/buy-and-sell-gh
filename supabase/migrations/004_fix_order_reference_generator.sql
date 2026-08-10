-- Fix order reference generation for Supabase projects where pgcrypto lives in the extensions schema.
-- Run after 003_orders.sql. This does not modify existing orders, order items, or products.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.generate_order_reference()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  candidate text;
begin
  loop
    candidate := 'BSG-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(encode(extensions.gen_random_bytes(2), 'hex'), 1, 4));
    exit when not exists (select 1 from public.orders where reference_number = candidate);
  end loop;
  return candidate;
end;
$$;

revoke all on function public.generate_order_reference() from public;

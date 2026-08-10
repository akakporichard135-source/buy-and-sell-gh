-- Buy & Sell GH production catalogue foundation.
-- Run this in the Supabase SQL editor or through Supabase migrations.

create extension if not exists "pgcrypto";

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  brand text not null default 'Apple',
  category text not null,
  subcategory text,
  model text not null,
  generation text,
  description text not null default '',
  short_description text,
  price numeric(12,2) not null default 0 check (price >= 0),
  previous_price numeric(12,2) check (previous_price is null or previous_price >= 0),
  price_on_request boolean not null default false,
  condition text not null check (condition in ('Brand New', 'UK Used', 'Excellent', 'Very Good')),
  storage_options jsonb not null default '[]'::jsonb,
  colour_options jsonb not null default '[]'::jsonb,
  default_colour text,
  battery_health text,
  warranty text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  stock_status text not null default 'In Stock' check (stock_status in ('In Stock', 'Low Stock', 'Out of Stock', 'Sold')),
  featured boolean not null default false,
  new_arrival boolean not null default false,
  popular boolean not null default false,
  available boolean not null default true,
  images jsonb not null default '[]'::jsonb,
  primary_image integer not null default 0 check (primary_image >= 0),
  specifications jsonb not null default '[]'::jsonb,
  included_items jsonb not null default '[]'::jsonb,
  delivery_information text,
  tags jsonb not null default '[]'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_public_catalog_idx on public.products (archived, available, category, stock_status, created_at desc);
create index if not exists products_slug_idx on public.products (slug);
create index if not exists admin_profiles_role_idx on public.admin_profiles (role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
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
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role = 'owner'
  );
$$;

alter table public.products enable row level security;
alter table public.admin_profiles enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
using (archived = false and available = true);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Owners can delete products" on public.products;
create policy "Owners can delete products"
on public.products for delete
to authenticated
using (public.is_owner());

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.is_admin());

drop policy if exists "Owners can manage admin profiles" on public.admin_profiles;
create policy "Owners can manage admin profiles"
on public.admin_profiles for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

-- Storage bucket for product images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());

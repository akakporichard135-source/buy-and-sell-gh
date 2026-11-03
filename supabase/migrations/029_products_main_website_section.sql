-- Migration 029: Add main_website_section to products
-- Allows explicit, persistent assignment of products to:
-- 'Mac', 'iPad', 'iPhone', 'Watch', 'AirPods', 'Accessories', 'Others'

alter table public.products
  add column if not exists main_website_section text;

-- Populate main_website_section for existing products
update public.products
set main_website_section = case
  when category in ('iPhones', 'Phones', 'Mobile Phones') or (brand = 'Apple' and name ilike '%iphone%') then 'iPhone'
  when category in ('MacBooks', 'Laptops') or (brand = 'Apple' and (name ilike '%macbook%' or name ilike '%mac mini%' or name ilike '%mac studio%' or name ilike '%imac%')) then 'Mac'
  when category in ('iPads', 'Tablets') or (brand = 'Apple' and name ilike '%ipad%') then 'iPad'
  when category in ('Apple Watches', 'Watches') or (brand = 'Apple' and (name ilike '%apple watch%' or name ilike '%watch%')) then 'Watch'
  when category in ('AirPods', 'Audio') or (brand = 'Apple' and name ilike '%airpod%') then 'AirPods'
  when category = 'Accessories' then 'Accessories'
  when category in ('Others', 'Game Consoles', 'Electronics') or brand not in ('Apple') then 'Others'
  else 'Others'
end
where main_website_section is null;

create index if not exists idx_products_main_website_section on public.products (main_website_section);

notify pgrst, 'reload schema';

-- Migration: 014_seed_product_variants_pricing.sql
-- Initial pricing dataset for Buy & Sell GH.
-- Contains base price updates for all 112 products and seed records for all 273 configuration variants.
-- Future price adjustments should be performed directly via the Admin Dashboard.

begin;

-- 1. Update Base Product Selling Prices
update public.products set price = 22500, price_on_request = false where id = 'iphone-17-pro-max';
update public.products set price = 19500, price_on_request = false where id = 'iphone-17-pro';
update public.products set price = 17500, price_on_request = false where id = 'iphone-air';
update public.products set price = 15500, price_on_request = false where id = 'iphone-17';
update public.products set price = 15200, price_on_request = false where id = 'iphone-16-plus';
update public.products set price = 13500, price_on_request = false where id = 'iphone-16';
update public.products set price = 10200, price_on_request = false where id = 'iphone-16e';
update public.products set price = 12800, price_on_request = false where id = 'iphone-15-pro';
update public.products set price = 11800, price_on_request = false where id = 'iphone-15-plus';
update public.products set price = 9800, price_on_request = false where id = 'iphone-14-pro';
update public.products set price = 8500, price_on_request = false where id = 'iphone-14-plus';
update public.products set price = 7800, price_on_request = false where id = 'iphone-14';
update public.products set price = 7400, price_on_request = false where id = 'iphone-13-pro';
update public.products set price = 6200, price_on_request = false where id = 'iphone-13';
update public.products set price = 5400, price_on_request = false where id = 'iphone-13-mini';
update public.products set price = 5400, price_on_request = false where id = 'iphone-12-pro';
update public.products set price = 4400, price_on_request = false where id = 'iphone-12';
update public.products set price = 3900, price_on_request = false where id = 'iphone-12-mini';
update public.products set price = 20500, price_on_request = false where id = 'iphone-16-pro-max';
update public.products set price = 17800, price_on_request = false where id = 'iphone-16-pro';
update public.products set price = 14500, price_on_request = false where id = 'iphone-15-pro-max';
update public.products set price = 9800, price_on_request = false where id = 'iphone-15';
update public.products set price = 11200, price_on_request = false where id = 'iphone-14-pro-max';
update public.products set price = 8200, price_on_request = false where id = 'iphone-13-pro-max';
update public.products set price = 6400, price_on_request = false where id = 'iphone-12-pro-max';
update public.products set price = 5800, price_on_request = false where id = 'ipad-10th-generation';
update public.products set price = 5800, price_on_request = false where id = 'ipad-a16';
update public.products set price = 5500, price_on_request = false where id = 'ipad-mini-6';
update public.products set price = 8200, price_on_request = false where id = 'ipad-mini-a17-pro';
update public.products set price = 6800, price_on_request = false where id = 'ipad-air-5';
update public.products set price = 10200, price_on_request = false where id = 'ipad-air-11-inch-m2';
update public.products set price = 13500, price_on_request = false where id = 'ipad-air-13-inch-m2';
update public.products set price = 10200, price_on_request = false where id = 'ipad-air-11-inch-m3';
update public.products set price = 13500, price_on_request = false where id = 'ipad-air-13-inch-m3';
update public.products set price = 10200, price_on_request = false where id = 'ipad-air-11-inch-m4';
update public.products set price = 13500, price_on_request = false where id = 'ipad-air-13-inch-m4';
update public.products set price = 11800, price_on_request = false where id = 'ipad-pro-11-inch-m2';
update public.products set price = 14800, price_on_request = false where id = 'ipad-pro-12-9-inch-m2';
update public.products set price = 17200, price_on_request = false where id = 'ipad-pro-11-inch-m4';
update public.products set price = 21500, price_on_request = false where id = 'ipad-pro-13-inch-m4';
update public.products set price = 17200, price_on_request = false where id = 'ipad-pro-11-inch-m5';
update public.products set price = 21500, price_on_request = false where id = 'ipad-pro-13-inch-m5';
update public.products set price = 13800, price_on_request = false where id = 'ipad-pro';
update public.products set price = 12500, price_on_request = false where id = 'apple-watch-ultra-3';
update public.products set price = 6800, price_on_request = false where id = 'apple-watch-series-11';
update public.products set price = 4200, price_on_request = false where id = 'apple-watch-se-3';
update public.products set price = 6800, price_on_request = false where id = 'apple-watch-series-10';
update public.products set price = 12500, price_on_request = false where id = 'apple-watch-ultra-2';
update public.products set price = 4600, price_on_request = false where id = 'apple-watch-series-9';
update public.products set price = 3800, price_on_request = false where id = 'apple-watch-series-8';
update public.products set price = 7800, price_on_request = false where id = 'apple-watch-ultra';
update public.products set price = 3100, price_on_request = false where id = 'apple-watch-series-7';
update public.products set price = 3200, price_on_request = false where id = 'apple-watch-se-2';
update public.products set price = 2600, price_on_request = false where id = 'apple-watch';
update public.products set price = 2200, price_on_request = false where id = 'airpods-pro';
update public.products set price = 1400, price_on_request = false where id = 'airpods-2nd-generation';
update public.products set price = 1900, price_on_request = false where id = 'airpods-3rd-generation';
update public.products set price = 2100, price_on_request = false where id = 'airpods-4';
update public.products set price = 2800, price_on_request = false where id = 'airpods-4-anc';
update public.products set price = 2200, price_on_request = false where id = 'airpods-pro-1';
update public.products set price = 3600, price_on_request = false where id = 'airpods-pro-2';
update public.products set price = 3600, price_on_request = false where id = 'airpods-pro-3';
update public.products set price = 6200, price_on_request = false where id = 'airpods-max-lightning';
update public.products set price = 8900, price_on_request = false where id = 'airpods-max-usb-c';
update public.products set price = 8900, price_on_request = false where id = 'airpods-max-2';
update public.products set price = 19000, price_on_request = false where id = 'macbook-air-13-m5';
update public.products set price = 19000, price_on_request = false where id = 'macbook-air-15-m5';
update public.products set price = 17500, price_on_request = false where id = 'macbook-air-13-m4';
update public.products set price = 20500, price_on_request = false where id = 'macbook-air-15-m4';
update public.products set price = 15800, price_on_request = false where id = 'macbook-air-13-m3';
update public.products set price = 18800, price_on_request = false where id = 'macbook-air-15-m3';
update public.products set price = 13500, price_on_request = false where id = 'macbook-air-13-m2';
update public.products set price = 15800, price_on_request = false where id = 'macbook-air-15-m2';
update public.products set price = 9800, price_on_request = false where id = 'macbook-air-13-m1';
update public.products set price = 27500, price_on_request = false where id = 'macbook-pro-14-m5';
update public.products set price = 27500, price_on_request = false where id = 'macbook-pro-14-m5-pro-max';
update public.products set price = 41500, price_on_request = false where id = 'macbook-pro-16-m5-pro-max';
update public.products set price = 24500, price_on_request = false where id = 'macbook-pro-14-m4';
update public.products set price = 31000, price_on_request = false where id = 'macbook-pro-14-m4-pro-max';
update public.products set price = 38500, price_on_request = false where id = 'macbook-pro-16-m4-pro-max';
update public.products set price = 21500, price_on_request = false where id = 'macbook-pro-14-m3';
update public.products set price = 21500, price_on_request = false where id = 'macbook-pro-14-m3-pro-max';
update public.products set price = 28500, price_on_request = false where id = 'macbook-pro-16-m3-pro-max';
update public.products set price = 17500, price_on_request = false where id = 'macbook-pro-13-m2';
update public.products set price = 17500, price_on_request = false where id = 'macbook-pro-14-m2-pro-max';
update public.products set price = 24000, price_on_request = false where id = 'macbook-pro-16-m2-pro-max';
update public.products set price = 14500, price_on_request = false where id = 'macbook-pro-13-m1';
update public.products set price = 14500, price_on_request = false where id = 'macbook-pro-14-m1-pro-max';
update public.products set price = 19500, price_on_request = false where id = 'macbook-pro-16-m1-pro-max';
update public.products set price = 350, price_on_request = false where id = 'apple-20w-usb-c-power-adapter';
update public.products set price = 550, price_on_request = false where id = 'apple-30w-usb-c-power-adapter';
update public.products set price = 850, price_on_request = false where id = 'apple-35w-dual-usb-c-power-adapter';
update public.products set price = 950, price_on_request = false where id = 'apple-70w-usb-c-power-adapter';
update public.products set price = 1250, price_on_request = false where id = 'apple-96w-usb-c-power-adapter';
update public.products set price = 1600, price_on_request = false where id = 'apple-140w-usb-c-power-adapter';
update public.products set price = 650, price_on_request = false where id = 'apple-magsafe-charger';
update public.products set price = 320, price_on_request = false where id = 'apple-usb-c-charge-cable';
update public.products set price = 320, price_on_request = false where id = 'apple-usb-c-to-lightning-cable';
update public.products set price = 320, price_on_request = false where id = 'apple-60w-usb-c-charge-cable';
update public.products set price = 480, price_on_request = false where id = 'apple-240w-usb-c-charge-cable';
update public.products set price = 780, price_on_request = false where id = 'apple-usb-c-to-magsafe-3-cable';
update public.products set price = 750, price_on_request = false where id = 'apple-magsafe-iphone-case';
update public.products set price = 750, price_on_request = false where id = 'apple-clear-iphone-case-magsafe';
update public.products set price = 1250, price_on_request = false where id = 'apple-pencil-usb-c';
update public.products set price = 2100, price_on_request = false where id = 'apple-pencil-pro';
update public.products set price = 4800, price_on_request = false where id = 'apple-magic-keyboard-ipad';
update public.products set price = 3900, price_on_request = false where id = 'apple-magic-keyboard-folio';
update public.products set price = 1250, price_on_request = false where id = 'apple-magic-mouse';
update public.products set price = 2100, price_on_request = false where id = 'apple-magic-trackpad';
update public.products set price = 1600, price_on_request = false where id = 'apple-magic-keyboard';
update public.products set price = 2400, price_on_request = false where id = 'apple-magic-keyboard-touch-id';
update public.products set price = 480, price_on_request = false where id = 'apple-watch-magnetic-fast-charger-usb-c';

-- 2. Upsert Initial Product Configuration Variants
insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-max-256gb-brand-new',
  'iphone-17-pro-max',
  'iPhone 17 Pro Max 256GB',
  'BSGH-IPHONE-17--1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-max-512gb-brand-new',
  'iphone-17-pro-max',
  'iPhone 17 Pro Max 512GB',
  'BSGH-IPHONE-17--2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  25000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-max-1tb-brand-new',
  'iphone-17-pro-max',
  'iPhone 17 Pro Max 1TB',
  'BSGH-IPHONE-17--3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-max-2tb-brand-new',
  'iphone-17-pro-max',
  'iPhone 17 Pro Max 2TB',
  'BSGH-IPHONE-17--4',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  30000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-256gb-brand-new',
  'iphone-17-pro',
  'iPhone 17 Pro 256GB',
  'BSGH-IPHONE-17--1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  19500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-512gb-brand-new',
  'iphone-17-pro',
  'iPhone 17 Pro 512GB',
  'BSGH-IPHONE-17--2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-pro-1tb-brand-new',
  'iphone-17-pro',
  'iPhone 17 Pro 1TB',
  'BSGH-IPHONE-17--3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  24500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-air-256gb-brand-new',
  'iphone-air',
  'iPhone Air 256GB',
  'BSGH-IPHONE-AIR-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-air-512gb-brand-new',
  'iphone-air',
  'iPhone Air 512GB',
  'BSGH-IPHONE-AIR-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  20000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-air-1tb-brand-new',
  'iphone-air',
  'iPhone Air 1TB',
  'BSGH-IPHONE-AIR-3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-256gb-brand-new',
  'iphone-17',
  'iPhone 17 256GB',
  'BSGH-IPHONE-17-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  15500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-17-512gb-brand-new',
  'iphone-17',
  'iPhone 17 512GB',
  'BSGH-IPHONE-17-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  18000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-plus-128gb-brand-new',
  'iphone-16-plus',
  'iPhone 16 Plus 128GB',
  'BSGH-IPHONE-16--1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-plus-256gb-brand-new',
  'iphone-16-plus',
  'iPhone 16 Plus 256GB',
  'BSGH-IPHONE-16--2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  16800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-plus-512gb-brand-new',
  'iphone-16-plus',
  'iPhone 16 Plus 512GB',
  'BSGH-IPHONE-16--3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  19800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-128gb-brand-new',
  'iphone-16',
  'iPhone 16 128GB',
  'BSGH-IPHONE-16-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  13500,
  14200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-256gb-brand-new',
  'iphone-16',
  'iPhone 16 256GB',
  'BSGH-IPHONE-16-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-512gb-brand-new',
  'iphone-16',
  'iPhone 16 512GB',
  'BSGH-IPHONE-16-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  18200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16e-128gb-brand-new',
  'iphone-16e',
  'iPhone 16e 128GB',
  'BSGH-IPHONE-16E-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  10200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16e-256gb-brand-new',
  'iphone-16e',
  'iPhone 16e 256GB',
  'BSGH-IPHONE-16E-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16e-512gb-brand-new',
  'iphone-16e',
  'iPhone 16e 512GB',
  'BSGH-IPHONE-16E-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-128gb-uk-used',
  'iphone-15-pro',
  'iPhone 15 Pro 128GB (UK Used)',
  'BSGH-IPHONE-15--1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  12800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-256gb-uk-used',
  'iphone-15-pro',
  'iPhone 15 Pro 256GB (UK Used)',
  'BSGH-IPHONE-15--2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  13900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-512gb-uk-used',
  'iphone-15-pro',
  'iPhone 15 Pro 512GB (UK Used)',
  'BSGH-IPHONE-15--3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-1tb-uk-used',
  'iphone-15-pro',
  'iPhone 15 Pro 1TB (UK Used)',
  'BSGH-IPHONE-15--4',
  '1TB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  16500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-plus-128gb-uk-used',
  'iphone-15-plus',
  'iPhone 15 Plus 128GB (UK Used)',
  'BSGH-IPHONE-15--1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-plus-256gb-uk-used',
  'iphone-15-plus',
  'iPhone 15 Plus 256GB (UK Used)',
  'BSGH-IPHONE-15--2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  13200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-plus-512gb-uk-used',
  'iphone-15-plus',
  'iPhone 15 Plus 512GB (UK Used)',
  'BSGH-IPHONE-15--3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  14800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-128gb-uk-used',
  'iphone-14-pro',
  'iPhone 14 Pro 128GB (UK Used)',
  'BSGH-IPHONE-14--1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  9800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-256gb-uk-used',
  'iphone-14-pro',
  'iPhone 14 Pro 256GB (UK Used)',
  'BSGH-IPHONE-14--2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  10800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-512gb-uk-used',
  'iphone-14-pro',
  'iPhone 14 Pro 512GB (UK Used)',
  'BSGH-IPHONE-14--3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  11900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-1tb-uk-used',
  'iphone-14-pro',
  'iPhone 14 Pro 1TB (UK Used)',
  'BSGH-IPHONE-14--4',
  '1TB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  12900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-plus-128gb-uk-used',
  'iphone-14-plus',
  'iPhone 14 Plus 128GB (UK Used)',
  'BSGH-IPHONE-14--1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  8500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-plus-256gb-uk-used',
  'iphone-14-plus',
  'iPhone 14 Plus 256GB (UK Used)',
  'BSGH-IPHONE-14--2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  9500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-plus-512gb-uk-used',
  'iphone-14-plus',
  'iPhone 14 Plus 512GB (UK Used)',
  'BSGH-IPHONE-14--3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  10800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-128gb-uk-used',
  'iphone-14',
  'iPhone 14 128GB (UK Used)',
  'BSGH-IPHONE-14-1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  7800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-256gb-uk-used',
  'iphone-14',
  'iPhone 14 256GB (UK Used)',
  'BSGH-IPHONE-14-2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  8800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-512gb-uk-used',
  'iphone-14',
  'iPhone 14 512GB (UK Used)',
  'BSGH-IPHONE-14-3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  10000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-128gb-very-good',
  'iphone-13-pro',
  'iPhone 13 Pro 128GB (Very Good)',
  'BSGH-IPHONE-13--1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  7400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-256gb-very-good',
  'iphone-13-pro',
  'iPhone 13 Pro 256GB (Very Good)',
  'BSGH-IPHONE-13--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  8200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-512gb-very-good',
  'iphone-13-pro',
  'iPhone 13 Pro 512GB (Very Good)',
  'BSGH-IPHONE-13--3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  9200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-1tb-very-good',
  'iphone-13-pro',
  'iPhone 13 Pro 1TB (Very Good)',
  'BSGH-IPHONE-13--4',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  10200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-128gb-very-good',
  'iphone-13',
  'iPhone 13 128GB (Very Good)',
  'BSGH-IPHONE-13-1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-256gb-very-good',
  'iphone-13',
  'iPhone 13 256GB (Very Good)',
  'BSGH-IPHONE-13-2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  7200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-512gb-very-good',
  'iphone-13',
  'iPhone 13 512GB (Very Good)',
  'BSGH-IPHONE-13-3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  8200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-mini-128gb-very-good',
  'iphone-13-mini',
  'iPhone 13 mini 128GB (Very Good)',
  'BSGH-IPHONE-13--1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  5400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-mini-256gb-very-good',
  'iphone-13-mini',
  'iPhone 13 mini 256GB (Very Good)',
  'BSGH-IPHONE-13--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-mini-512gb-very-good',
  'iphone-13-mini',
  'iPhone 13 mini 512GB (Very Good)',
  'BSGH-IPHONE-13--3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  7200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-128gb-very-good',
  'iphone-12-pro',
  'iPhone 12 Pro 128GB (Very Good)',
  'BSGH-IPHONE-12--1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  5400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-256gb-very-good',
  'iphone-12-pro',
  'iPhone 12 Pro 256GB (Very Good)',
  'BSGH-IPHONE-12--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-512gb-very-good',
  'iphone-12-pro',
  'iPhone 12 Pro 512GB (Very Good)',
  'BSGH-IPHONE-12--3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-64gb-very-good',
  'iphone-12',
  'iPhone 12 64GB (Very Good)',
  'BSGH-IPHONE-12-1',
  '64GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  4400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-128gb-very-good',
  'iphone-12',
  'iPhone 12 128GB (Very Good)',
  'BSGH-IPHONE-12-2',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  4900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-256gb-very-good',
  'iphone-12',
  'iPhone 12 256GB (Very Good)',
  'BSGH-IPHONE-12-3',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  5600,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-mini-64gb-very-good',
  'iphone-12-mini',
  'iPhone 12 mini 64GB (Very Good)',
  'BSGH-IPHONE-12--1',
  '64GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  3900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-mini-128gb-very-good',
  'iphone-12-mini',
  'iPhone 12 mini 128GB (Very Good)',
  'BSGH-IPHONE-12--2',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  4400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-mini-256gb-very-good',
  'iphone-12-mini',
  'iPhone 12 mini 256GB (Very Good)',
  'BSGH-IPHONE-12--3',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  4900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-max-256gb-brand-new',
  'iphone-16-pro-max',
  'iPhone 16 Pro Max 256GB',
  'BSGH-IPHONE-16--1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  20500,
  21500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-max-512gb-brand-new',
  'iphone-16-pro-max',
  'iPhone 16 Pro Max 512GB',
  'BSGH-IPHONE-16--2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  23800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-max-1tb-brand-new',
  'iphone-16-pro-max',
  'iPhone 16 Pro Max 1TB',
  'BSGH-IPHONE-16--3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  27200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-128gb-brand-new',
  'iphone-16-pro',
  'iPhone 16 Pro 128GB',
  'BSGH-IPHONE-16--1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  17800,
  18500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-256gb-brand-new',
  'iphone-16-pro',
  'iPhone 16 Pro 256GB',
  'BSGH-IPHONE-16--2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  19500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-512gb-brand-new',
  'iphone-16-pro',
  'iPhone 16 Pro 512GB',
  'BSGH-IPHONE-16--3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-16-pro-1tb-brand-new',
  'iphone-16-pro',
  'iPhone 16 Pro 1TB',
  'BSGH-IPHONE-16--4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  25800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-max-256gb-uk-used',
  'iphone-15-pro-max',
  'iPhone 15 Pro Max 256GB (UK Used)',
  'BSGH-IPHONE-15--1',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  14500,
  15200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-max-512gb-uk-used',
  'iphone-15-pro-max',
  'iPhone 15 Pro Max 512GB (UK Used)',
  'BSGH-IPHONE-15--2',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  16200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-pro-max-1tb-uk-used',
  'iphone-15-pro-max',
  'iPhone 15 Pro Max 1TB (UK Used)',
  'BSGH-IPHONE-15--3',
  '1TB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  17800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-128gb-excellent',
  'iphone-15',
  'iPhone 15 128GB (Excellent)',
  'BSGH-IPHONE-15-1',
  '128GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  9800,
  10500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-256gb-excellent',
  'iphone-15',
  'iPhone 15 256GB (Excellent)',
  'BSGH-IPHONE-15-2',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  11200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-15-512gb-excellent',
  'iphone-15',
  'iPhone 15 512GB (Excellent)',
  'BSGH-IPHONE-15-3',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  12800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-max-128gb-uk-used',
  'iphone-14-pro-max',
  'iPhone 14 Pro Max 128GB (UK Used)',
  'BSGH-IPHONE-14--1',
  '128GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  11200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-max-256gb-uk-used',
  'iphone-14-pro-max',
  'iPhone 14 Pro Max 256GB (UK Used)',
  'BSGH-IPHONE-14--2',
  '256GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  12200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-max-512gb-uk-used',
  'iphone-14-pro-max',
  'iPhone 14 Pro Max 512GB (UK Used)',
  'BSGH-IPHONE-14--3',
  '512GB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  13500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-14-pro-max-1tb-uk-used',
  'iphone-14-pro-max',
  'iPhone 14 Pro Max 1TB (UK Used)',
  'BSGH-IPHONE-14--4',
  '1TB',
  'UK Used',
  NULL,
  NULL,
  NULL,
  NULL,
  14800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-max-128gb-very-good',
  'iphone-13-pro-max',
  'iPhone 13 Pro Max 128GB (Very Good)',
  'BSGH-IPHONE-13--1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  8200,
  8800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-max-256gb-very-good',
  'iphone-13-pro-max',
  'iPhone 13 Pro Max 256GB (Very Good)',
  'BSGH-IPHONE-13--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  9200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-max-512gb-very-good',
  'iphone-13-pro-max',
  'iPhone 13 Pro Max 512GB (Very Good)',
  'BSGH-IPHONE-13--3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  10200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-13-pro-max-1tb-very-good',
  'iphone-13-pro-max',
  'iPhone 13 Pro Max 1TB (Very Good)',
  'BSGH-IPHONE-13--4',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  11200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-max-128gb-very-good',
  'iphone-12-pro-max',
  'iPhone 12 Pro Max 128GB (Very Good)',
  'BSGH-IPHONE-12--1',
  '128GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-max-256gb-very-good',
  'iphone-12-pro-max',
  'iPhone 12 Pro Max 256GB (Very Good)',
  'BSGH-IPHONE-12--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  7100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'iphone-12-pro-max-512gb-very-good',
  'iphone-12-pro-max',
  'iPhone 12 Pro Max 512GB (Very Good)',
  'BSGH-IPHONE-12--3',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  7800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-10th-generation-64gb-wi-fi-brand-new',
  'ipad-10th-generation',
  'iPad (10th generation) 64GB Wi-Fi',
  'BSGH-IPAD-10TH--1',
  '64GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  5800,
  6200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-10th-generation-256gb-wi-fi-brand-new',
  'ipad-10th-generation',
  'iPad (10th generation) 256GB Wi-Fi',
  'BSGH-IPAD-10TH--2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  7800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-a16-64gb-wi-fi-brand-new',
  'ipad-a16',
  'iPad (A16) 64GB Wi-Fi',
  'BSGH-IPAD-A16-1',
  '64GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  5800,
  6200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-a16-256gb-wi-fi-brand-new',
  'ipad-a16',
  'iPad (A16) 256GB Wi-Fi',
  'BSGH-IPAD-A16-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  7800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-mini-6-64gb-very-good',
  'ipad-mini-6',
  'iPad mini (6th generation) 64GB (Very Good)',
  'BSGH-IPAD-MINI--1',
  '64GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  5500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-mini-6-256gb-very-good',
  'ipad-mini-6',
  'iPad mini (6th generation) 256GB (Very Good)',
  'BSGH-IPAD-MINI--2',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-mini-a17-pro-128gb-wi-fi-brand-new',
  'ipad-mini-a17-pro',
  'iPad mini (A17 Pro) 128GB Wi-Fi',
  'BSGH-IPAD-MINI--1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  8200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-mini-a17-pro-256gb-wi-fi-brand-new',
  'ipad-mini-a17-pro',
  'iPad mini (A17 Pro) 256GB Wi-Fi',
  'BSGH-IPAD-MINI--2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  9800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-mini-a17-pro-512gb-wi-fi-brand-new',
  'ipad-mini-a17-pro',
  'iPad mini (A17 Pro) 512GB Wi-Fi',
  'BSGH-IPAD-MINI--3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  12500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-5-64gb-excellent',
  'ipad-air-5',
  'iPad Air (5th generation) 64GB (Excellent)',
  'BSGH-IPAD-AIR-5-1',
  '64GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  6800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-5-256gb-excellent',
  'ipad-air-5',
  'iPad Air (5th generation) 256GB (Excellent)',
  'BSGH-IPAD-AIR-5-2',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  8200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m2-128gb-wi-fi-brand-new',
  'ipad-air-11-inch-m2',
  'iPad Air 11-inch (M2) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  10200,
  10800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m2-256gb-wi-fi-brand-new',
  'ipad-air-11-inch-m2',
  'iPad Air 11-inch (M2) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m2-512gb-wi-fi-brand-new',
  'ipad-air-11-inch-m2',
  'iPad Air 11-inch (M2) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m2-1tb-wi-fi-brand-new',
  'ipad-air-11-inch-m2',
  'iPad Air 11-inch (M2) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m2-128gb-wi-fi-brand-new',
  'ipad-air-13-inch-m2',
  'iPad Air 13-inch (M2) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  13500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m2-256gb-wi-fi-brand-new',
  'ipad-air-13-inch-m2',
  'iPad Air 13-inch (M2) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m2-512gb-wi-fi-brand-new',
  'ipad-air-13-inch-m2',
  'iPad Air 13-inch (M2) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m2-1tb-wi-fi-brand-new',
  'ipad-air-13-inch-m2',
  'iPad Air 13-inch (M2) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  20800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m3-128gb-wi-fi-brand-new',
  'ipad-air-11-inch-m3',
  'iPad Air 11-inch (M3) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  10200,
  10800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m3-256gb-wi-fi-brand-new',
  'ipad-air-11-inch-m3',
  'iPad Air 11-inch (M3) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m3-512gb-wi-fi-brand-new',
  'ipad-air-11-inch-m3',
  'iPad Air 11-inch (M3) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m3-1tb-wi-fi-brand-new',
  'ipad-air-11-inch-m3',
  'iPad Air 11-inch (M3) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m3-128gb-wi-fi-brand-new',
  'ipad-air-13-inch-m3',
  'iPad Air 13-inch (M3) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  13500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m3-256gb-wi-fi-brand-new',
  'ipad-air-13-inch-m3',
  'iPad Air 13-inch (M3) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m3-512gb-wi-fi-brand-new',
  'ipad-air-13-inch-m3',
  'iPad Air 13-inch (M3) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m3-1tb-wi-fi-brand-new',
  'ipad-air-13-inch-m3',
  'iPad Air 13-inch (M3) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  20800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m4-128gb-wi-fi-brand-new',
  'ipad-air-11-inch-m4',
  'iPad Air 11-inch (M4) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  10200,
  10800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m4-256gb-wi-fi-brand-new',
  'ipad-air-11-inch-m4',
  'iPad Air 11-inch (M4) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m4-512gb-wi-fi-brand-new',
  'ipad-air-11-inch-m4',
  'iPad Air 11-inch (M4) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-11-inch-m4-1tb-wi-fi-brand-new',
  'ipad-air-11-inch-m4',
  'iPad Air 11-inch (M4) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m4-128gb-wi-fi-brand-new',
  'ipad-air-13-inch-m4',
  'iPad Air 13-inch (M4) 128GB Wi-Fi',
  'BSGH-IPAD-AIR-1-1',
  '128GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  13500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m4-256gb-wi-fi-brand-new',
  'ipad-air-13-inch-m4',
  'iPad Air 13-inch (M4) 256GB Wi-Fi',
  'BSGH-IPAD-AIR-1-2',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  15200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m4-512gb-wi-fi-brand-new',
  'ipad-air-13-inch-m4',
  'iPad Air 13-inch (M4) 512GB Wi-Fi',
  'BSGH-IPAD-AIR-1-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-air-13-inch-m4-1tb-wi-fi-brand-new',
  'ipad-air-13-inch-m4',
  'iPad Air 13-inch (M4) 1TB Wi-Fi',
  'BSGH-IPAD-AIR-1-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  20800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m2-128gb-excellent',
  'ipad-pro-11-inch-m2',
  'iPad Pro 11-inch (M2) 128GB (Excellent)',
  'BSGH-IPAD-PRO-1-1',
  '128GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m2-256gb-excellent',
  'ipad-pro-11-inch-m2',
  'iPad Pro 11-inch (M2) 256GB (Excellent)',
  'BSGH-IPAD-PRO-1-2',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  13800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m2-512gb-excellent',
  'ipad-pro-11-inch-m2',
  'iPad Pro 11-inch (M2) 512GB (Excellent)',
  'BSGH-IPAD-PRO-1-3',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  15800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-12-9-inch-m2-128gb-excellent',
  'ipad-pro-12-9-inch-m2',
  'iPad Pro 12.9-inch (M2) 128GB (Excellent)',
  'BSGH-IPAD-PRO-1-1',
  '128GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  14800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-12-9-inch-m2-256gb-excellent',
  'ipad-pro-12-9-inch-m2',
  'iPad Pro 12.9-inch (M2) 256GB (Excellent)',
  'BSGH-IPAD-PRO-1-2',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  16800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-12-9-inch-m2-512gb-excellent',
  'ipad-pro-12-9-inch-m2',
  'iPad Pro 12.9-inch (M2) 512GB (Excellent)',
  'BSGH-IPAD-PRO-1-3',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  18800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m4-256gb-wi-fi-brand-new',
  'ipad-pro-11-inch-m4',
  'iPad Pro 11-inch (M4) 256GB Wi-Fi',
  'BSGH-IPAD-PRO-1-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17200,
  18000,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m4-512gb-wi-fi-brand-new',
  'ipad-pro-11-inch-m4',
  'iPad Pro 11-inch (M4) 512GB Wi-Fi',
  'BSGH-IPAD-PRO-1-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  20200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m4-1tb-wi-fi-brand-new',
  'ipad-pro-11-inch-m4',
  'iPad Pro 11-inch (M4) 1TB Wi-Fi',
  'BSGH-IPAD-PRO-1-3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  25500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m4-2tb-wi-fi-brand-new',
  'ipad-pro-11-inch-m4',
  'iPad Pro 11-inch (M4) 2TB Wi-Fi',
  'BSGH-IPAD-PRO-1-4',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  31000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m4-256gb-wi-fi-brand-new',
  'ipad-pro-13-inch-m4',
  'iPad Pro 13-inch (M4) 256GB Wi-Fi',
  'BSGH-IPAD-PRO-1-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  21500,
  22800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m4-512gb-wi-fi-brand-new',
  'ipad-pro-13-inch-m4',
  'iPad Pro 13-inch (M4) 512GB Wi-Fi',
  'BSGH-IPAD-PRO-1-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  24500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m4-1tb-wi-fi-brand-new',
  'ipad-pro-13-inch-m4',
  'iPad Pro 13-inch (M4) 1TB Wi-Fi',
  'BSGH-IPAD-PRO-1-3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  29800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m4-2tb-wi-fi-brand-new',
  'ipad-pro-13-inch-m4',
  'iPad Pro 13-inch (M4) 2TB Wi-Fi',
  'BSGH-IPAD-PRO-1-4',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  35500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m5-256gb-wi-fi-brand-new',
  'ipad-pro-11-inch-m5',
  'iPad Pro 11-inch (M5) 256GB Wi-Fi',
  'BSGH-IPAD-PRO-1-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  17200,
  18000,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m5-512gb-wi-fi-brand-new',
  'ipad-pro-11-inch-m5',
  'iPad Pro 11-inch (M5) 512GB Wi-Fi',
  'BSGH-IPAD-PRO-1-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  20200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m5-1tb-wi-fi-brand-new',
  'ipad-pro-11-inch-m5',
  'iPad Pro 11-inch (M5) 1TB Wi-Fi',
  'BSGH-IPAD-PRO-1-3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  25500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-11-inch-m5-2tb-wi-fi-brand-new',
  'ipad-pro-11-inch-m5',
  'iPad Pro 11-inch (M5) 2TB Wi-Fi',
  'BSGH-IPAD-PRO-1-4',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  31000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m5-256gb-wi-fi-brand-new',
  'ipad-pro-13-inch-m5',
  'iPad Pro 13-inch (M5) 256GB Wi-Fi',
  'BSGH-IPAD-PRO-1-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  21500,
  22800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m5-512gb-wi-fi-brand-new',
  'ipad-pro-13-inch-m5',
  'iPad Pro 13-inch (M5) 512GB Wi-Fi',
  'BSGH-IPAD-PRO-1-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  24500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m5-1tb-wi-fi-brand-new',
  'ipad-pro-13-inch-m5',
  'iPad Pro 13-inch (M5) 1TB Wi-Fi',
  'BSGH-IPAD-PRO-1-3',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  29800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-13-inch-m5-2tb-wi-fi-brand-new',
  'ipad-pro-13-inch-m5',
  'iPad Pro 13-inch (M5) 2TB Wi-Fi',
  'BSGH-IPAD-PRO-1-4',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  'Wi-Fi',
  35500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'ipad-pro-256gb-excellent',
  'ipad-pro',
  'iPad Pro 256GB (Excellent)',
  'BSGH-IPAD-PRO-1',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  13800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-ultra-3-49mm-gps-cellular-brand-new',
  'apple-watch-ultra-3',
  'Apple Watch Ultra 3 49mm GPS + Cellular',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  '49mm',
  NULL,
  NULL,
  'GPS + Cellular',
  12500,
  13500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-11-42mm-gps-brand-new',
  'apple-watch-series-11',
  'Apple Watch Series 11 42mm GPS',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  '42mm',
  NULL,
  NULL,
  'GPS',
  6800,
  7200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-11-46mm-gps-brand-new',
  'apple-watch-series-11',
  'Apple Watch Series 11 46mm GPS',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Brand New',
  '46mm',
  NULL,
  NULL,
  'GPS',
  7400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-11-42mm-gps-cellular-brand-new',
  'apple-watch-series-11',
  'Apple Watch Series 11 42mm GPS + Cellular',
  'BSGH-APPLE-WATC-3',
  NULL,
  'Brand New',
  '42mm',
  NULL,
  NULL,
  'GPS + Cellular',
  8400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-11-46mm-gps-cellular-brand-new',
  'apple-watch-series-11',
  'Apple Watch Series 11 46mm GPS + Cellular',
  'BSGH-APPLE-WATC-4',
  NULL,
  'Brand New',
  '46mm',
  NULL,
  NULL,
  'GPS + Cellular',
  9000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-se-3-40mm-gps-brand-new',
  'apple-watch-se-3',
  'Apple Watch SE 3 40mm GPS',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  '40mm',
  NULL,
  NULL,
  'GPS',
  4200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-se-3-44mm-gps-brand-new',
  'apple-watch-se-3',
  'Apple Watch SE 3 44mm GPS',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Brand New',
  '44mm',
  NULL,
  NULL,
  'GPS',
  4700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-10-42mm-gps-brand-new',
  'apple-watch-series-10',
  'Apple Watch Series 10 42mm GPS',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  '42mm',
  NULL,
  NULL,
  'GPS',
  6800,
  7200,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-10-46mm-gps-brand-new',
  'apple-watch-series-10',
  'Apple Watch Series 10 46mm GPS',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Brand New',
  '46mm',
  NULL,
  NULL,
  'GPS',
  7400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-10-42mm-gps-cellular-brand-new',
  'apple-watch-series-10',
  'Apple Watch Series 10 42mm GPS + Cellular',
  'BSGH-APPLE-WATC-3',
  NULL,
  'Brand New',
  '42mm',
  NULL,
  NULL,
  'GPS + Cellular',
  8400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-10-46mm-gps-cellular-brand-new',
  'apple-watch-series-10',
  'Apple Watch Series 10 46mm GPS + Cellular',
  'BSGH-APPLE-WATC-4',
  NULL,
  'Brand New',
  '46mm',
  NULL,
  NULL,
  'GPS + Cellular',
  9000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-ultra-2-49mm-gps-cellular-brand-new',
  'apple-watch-ultra-2',
  'Apple Watch Ultra 2 49mm GPS + Cellular',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  '49mm',
  NULL,
  NULL,
  'GPS + Cellular',
  12500,
  13500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-9-41mm-gps-very-good',
  'apple-watch-series-9',
  'Apple Watch Series 9 41mm GPS (Very Good)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Very Good',
  '41mm',
  NULL,
  NULL,
  'GPS',
  4600,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-9-45mm-gps-very-good',
  'apple-watch-series-9',
  'Apple Watch Series 9 45mm GPS (Very Good)',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Very Good',
  '45mm',
  NULL,
  NULL,
  'GPS',
  5100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-8-41mm-gps-very-good',
  'apple-watch-series-8',
  'Apple Watch Series 8 41mm GPS (Very Good)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Very Good',
  '41mm',
  NULL,
  NULL,
  'GPS',
  3800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-8-45mm-gps-very-good',
  'apple-watch-series-8',
  'Apple Watch Series 8 45mm GPS (Very Good)',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Very Good',
  '45mm',
  NULL,
  NULL,
  'GPS',
  4200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-ultra-49mm-gps-cellular-very-good',
  'apple-watch-ultra',
  'Apple Watch Ultra 49mm GPS + Cellular (Very Good)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Very Good',
  '49mm',
  NULL,
  NULL,
  'GPS + Cellular',
  7800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-7-41mm-gps-very-good',
  'apple-watch-series-7',
  'Apple Watch Series 7 41mm GPS (Very Good)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Very Good',
  '41mm',
  NULL,
  NULL,
  'GPS',
  3100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-series-7-45mm-gps-very-good',
  'apple-watch-series-7',
  'Apple Watch Series 7 45mm GPS (Very Good)',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Very Good',
  '45mm',
  NULL,
  NULL,
  'GPS',
  3500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-se-2-40mm-gps-very-good',
  'apple-watch-se-2',
  'Apple Watch SE (2nd generation) 40mm GPS (Very Good)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Very Good',
  '40mm',
  NULL,
  NULL,
  'GPS',
  3200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-se-2-44mm-gps-very-good',
  'apple-watch-se-2',
  'Apple Watch SE (2nd generation) 44mm GPS (Very Good)',
  'BSGH-APPLE-WATC-2',
  NULL,
  'Very Good',
  '44mm',
  NULL,
  NULL,
  'GPS',
  3700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-excellent',
  'apple-watch',
  'Apple Watch (Excellent)',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  2600,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-pro-very-good',
  'airpods-pro',
  'AirPods Pro (Very Good)',
  'BSGH-AIRPODS-PR-1',
  NULL,
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  2200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-2nd-generation-very-good',
  'airpods-2nd-generation',
  'AirPods (2nd generation) (Very Good)',
  'BSGH-AIRPODS-2N-1',
  NULL,
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  1400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-3rd-generation-very-good',
  'airpods-3rd-generation',
  'AirPods (3rd generation) (Very Good)',
  'BSGH-AIRPODS-3R-1',
  NULL,
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  1900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-4-brand-new',
  'airpods-4',
  'AirPods 4',
  'BSGH-AIRPODS-4-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  2100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-4-anc-brand-new',
  'airpods-4-anc',
  'AirPods 4 with Active Noise Cancellation',
  'BSGH-AIRPODS-4--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  2800,
  3000,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-pro-1-very-good',
  'airpods-pro-1',
  'AirPods Pro (1st generation) (Very Good)',
  'BSGH-AIRPODS-PR-1',
  NULL,
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  2200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-pro-2-brand-new',
  'airpods-pro-2',
  'AirPods Pro 2',
  'BSGH-AIRPODS-PR-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  3600,
  3900,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-pro-3-brand-new',
  'airpods-pro-3',
  'AirPods Pro 3',
  'BSGH-AIRPODS-PR-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  3600,
  3900,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-max-lightning-very-good',
  'airpods-max-lightning',
  'AirPods Max (Lightning) (Very Good)',
  'BSGH-AIRPODS-MA-1',
  NULL,
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  6200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-max-usb-c-brand-new',
  'airpods-max-usb-c',
  'AirPods Max (USB-C)',
  'BSGH-AIRPODS-MA-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  8900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'airpods-max-2-brand-new',
  'airpods-max-2',
  'AirPods Max 2',
  'BSGH-AIRPODS-MA-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  8900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m5-512gb-brand-new',
  'macbook-air-13-m5',
  'MacBook Air 13-inch (M5) 512GB',
  'BSGH-MACBOOK-AI-1',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  19000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m5-1tb-brand-new',
  'macbook-air-13-m5',
  'MacBook Air 13-inch (M5) 1TB',
  'BSGH-MACBOOK-AI-2',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m5-2tb-brand-new',
  'macbook-air-13-m5',
  'MacBook Air 13-inch (M5) 2TB',
  'BSGH-MACBOOK-AI-3',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  26000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m5-4tb-brand-new',
  'macbook-air-13-m5',
  'MacBook Air 13-inch (M5) 4TB',
  'BSGH-MACBOOK-AI-4',
  '4TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  29500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m5-512gb-brand-new',
  'macbook-air-15-m5',
  'MacBook Air 15-inch (M5) 512GB',
  'BSGH-MACBOOK-AI-1',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  19000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m5-1tb-brand-new',
  'macbook-air-15-m5',
  'MacBook Air 15-inch (M5) 1TB',
  'BSGH-MACBOOK-AI-2',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m5-2tb-brand-new',
  'macbook-air-15-m5',
  'MacBook Air 15-inch (M5) 2TB',
  'BSGH-MACBOOK-AI-3',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  26000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m5-4tb-brand-new',
  'macbook-air-15-m5',
  'MacBook Air 15-inch (M5) 4TB',
  'BSGH-MACBOOK-AI-4',
  '4TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  29500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m4-256gb-16gb-brand-new',
  'macbook-air-13-m4',
  'MacBook Air 13-inch (M4) 16GB 256GB',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m4-512gb-16gb-brand-new',
  'macbook-air-13-m4',
  'MacBook Air 13-inch (M4) 16GB 512GB',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  20500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m4-512gb-24gb-brand-new',
  'macbook-air-13-m4',
  'MacBook Air 13-inch (M4) 24GB 512GB',
  'BSGH-MACBOOK-AI-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  23500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m4-1tb-24gb-brand-new',
  'macbook-air-13-m4',
  'MacBook Air 13-inch (M4) 24GB 1TB',
  'BSGH-MACBOOK-AI-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  26800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m4-256gb-16gb-brand-new',
  'macbook-air-15-m4',
  'MacBook Air 15-inch (M4) 16GB 256GB',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  20500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m4-512gb-16gb-brand-new',
  'macbook-air-15-m4',
  'MacBook Air 15-inch (M4) 16GB 512GB',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  23500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m4-512gb-24gb-brand-new',
  'macbook-air-15-m4',
  'MacBook Air 15-inch (M4) 24GB 512GB',
  'BSGH-MACBOOK-AI-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  26500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m4-1tb-24gb-brand-new',
  'macbook-air-15-m4',
  'MacBook Air 15-inch (M4) 24GB 1TB',
  'BSGH-MACBOOK-AI-4',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  29800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m3-256gb-16gb-brand-new',
  'macbook-air-13-m3',
  'MacBook Air 13-inch (M3) 16GB 256GB',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  15800,
  16800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m3-512gb-16gb-brand-new',
  'macbook-air-13-m3',
  'MacBook Air 13-inch (M3) 16GB 512GB',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  18800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m3-512gb-24gb-brand-new',
  'macbook-air-13-m3',
  'MacBook Air 13-inch (M3) 24GB 512GB',
  'BSGH-MACBOOK-AI-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  21800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m3-256gb-16gb-brand-new',
  'macbook-air-15-m3',
  'MacBook Air 15-inch (M3) 16GB 256GB',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  18800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m3-512gb-16gb-brand-new',
  'macbook-air-15-m3',
  'MacBook Air 15-inch (M3) 16GB 512GB',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '16GB',
  NULL,
  21800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m3-512gb-24gb-brand-new',
  'macbook-air-15-m3',
  'MacBook Air 15-inch (M3) 24GB 512GB',
  'BSGH-MACBOOK-AI-3',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  '24GB',
  NULL,
  24800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m2-256gb-8gb-16gb-excellent',
  'macbook-air-13-m2',
  'MacBook Air 13-inch (M2) 8GB/16GB 256GB (Excellent)',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  '8GB/16GB',
  NULL,
  13500,
  14500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m2-512gb-16gb-excellent',
  'macbook-air-13-m2',
  'MacBook Air 13-inch (M2) 16GB 512GB (Excellent)',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  '16GB',
  NULL,
  16200,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m2-256gb-8gb-16gb-excellent',
  'macbook-air-15-m2',
  'MacBook Air 15-inch (M2) 8GB/16GB 256GB (Excellent)',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Excellent',
  NULL,
  NULL,
  '8GB/16GB',
  NULL,
  15800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-15-m2-512gb-16gb-excellent',
  'macbook-air-15-m2',
  'MacBook Air 15-inch (M2) 16GB 512GB (Excellent)',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  '16GB',
  NULL,
  18500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m1-256gb-8gb-very-good',
  'macbook-air-13-m1',
  'MacBook Air 13-inch (M1) 8GB 256GB (Very Good)',
  'BSGH-MACBOOK-AI-1',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  '8GB',
  NULL,
  9800,
  10500,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-air-13-m1-512gb-8gb-16gb-very-good',
  'macbook-air-13-m1',
  'MacBook Air 13-inch (M1) 8GB/16GB 512GB (Very Good)',
  'BSGH-MACBOOK-AI-2',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  '8GB/16GB',
  NULL,
  11800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-512gb-brand-new',
  'macbook-pro-14-m5',
  'MacBook Pro 14-inch (M5) 512GB',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-1tb-brand-new',
  'macbook-pro-14-m5',
  'MacBook Pro 14-inch (M5) 1TB',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  31000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-2tb-brand-new',
  'macbook-pro-14-m5',
  'MacBook Pro 14-inch (M5) 2TB',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  34500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-4tb-brand-new',
  'macbook-pro-14-m5',
  'MacBook Pro 14-inch (M5) 4TB',
  'BSGH-MACBOOK-PR-4',
  '4TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  38000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-pro-max-1tb-brand-new',
  'macbook-pro-14-m5-pro-max',
  'MacBook Pro 14-inch (M5 Pro / M5 Max) 1TB',
  'BSGH-MACBOOK-PR-1',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-pro-max-2tb-brand-new',
  'macbook-pro-14-m5-pro-max',
  'MacBook Pro 14-inch (M5 Pro / M5 Max) 2TB',
  'BSGH-MACBOOK-PR-2',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  31000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-pro-max-4tb-brand-new',
  'macbook-pro-14-m5-pro-max',
  'MacBook Pro 14-inch (M5 Pro / M5 Max) 4TB',
  'BSGH-MACBOOK-PR-3',
  '4TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  34500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m5-pro-max-8tb-brand-new',
  'macbook-pro-14-m5-pro-max',
  'MacBook Pro 14-inch (M5 Pro / M5 Max) 8TB',
  'BSGH-MACBOOK-PR-4',
  '8TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  38000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m5-pro-max-1tb-brand-new',
  'macbook-pro-16-m5-pro-max',
  'MacBook Pro 16-inch (M5 Pro / M5 Max) 1TB',
  'BSGH-MACBOOK-PR-1',
  '1TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  41500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m5-pro-max-2tb-brand-new',
  'macbook-pro-16-m5-pro-max',
  'MacBook Pro 16-inch (M5 Pro / M5 Max) 2TB',
  'BSGH-MACBOOK-PR-2',
  '2TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  45000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m5-pro-max-4tb-brand-new',
  'macbook-pro-16-m5-pro-max',
  'MacBook Pro 16-inch (M5 Pro / M5 Max) 4TB',
  'BSGH-MACBOOK-PR-3',
  '4TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  48500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m5-pro-max-8tb-brand-new',
  'macbook-pro-16-m5-pro-max',
  'MacBook Pro 16-inch (M5 Pro / M5 Max) 8TB',
  'BSGH-MACBOOK-PR-4',
  '8TB',
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  52000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-512gb-m4-16gb-brand-new',
  'macbook-pro-14-m4',
  'MacBook Pro 14-inch (M4) M4 16GB 512GB',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Brand New',
  NULL,
  'M4',
  '16GB',
  NULL,
  24500,
  25800,
  true,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-1tb-m4-16gb-brand-new',
  'macbook-pro-14-m4',
  'MacBook Pro 14-inch (M4) M4 16GB 1TB',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Brand New',
  NULL,
  'M4',
  '16GB',
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-1tb-m4-24gb-brand-new',
  'macbook-pro-14-m4',
  'MacBook Pro 14-inch (M4) M4 24GB 1TB',
  'BSGH-MACBOOK-PR-3',
  '1TB',
  'Brand New',
  NULL,
  'M4',
  '24GB',
  NULL,
  30500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-pro-max-512gb-m4-pro-24gb-brand-new',
  'macbook-pro-14-m4-pro-max',
  'MacBook Pro 14-inch (M4 Pro / M4 Max) M4 Pro 24GB 512GB',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Brand New',
  NULL,
  'M4 Pro',
  '24GB',
  NULL,
  31000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-pro-max-1tb-m4-pro-24gb-brand-new',
  'macbook-pro-14-m4-pro-max',
  'MacBook Pro 14-inch (M4 Pro / M4 Max) M4 Pro 24GB 1TB',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Brand New',
  NULL,
  'M4 Pro',
  '24GB',
  NULL,
  34000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m4-pro-max-1tb-m4-max-36gb-brand-new',
  'macbook-pro-14-m4-pro-max',
  'MacBook Pro 14-inch (M4 Pro / M4 Max) M4 Max 36GB 1TB',
  'BSGH-MACBOOK-PR-3',
  '1TB',
  'Brand New',
  NULL,
  'M4 Max',
  '36GB',
  NULL,
  46500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m4-pro-max-512gb-m4-pro-24gb-brand-new',
  'macbook-pro-16-m4-pro-max',
  'MacBook Pro 16-inch (M4 Pro / M4 Max) M4 Pro 24GB 512GB',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Brand New',
  NULL,
  'M4 Pro',
  '24GB',
  NULL,
  38500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m4-pro-max-512gb-m4-pro-48gb-brand-new',
  'macbook-pro-16-m4-pro-max',
  'MacBook Pro 16-inch (M4 Pro / M4 Max) M4 Pro 48GB 512GB',
  'BSGH-MACBOOK-PR-2',
  '512GB',
  'Brand New',
  NULL,
  'M4 Pro',
  '48GB',
  NULL,
  44500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m4-pro-max-1tb-m4-max-36gb-brand-new',
  'macbook-pro-16-m4-pro-max',
  'MacBook Pro 16-inch (M4 Pro / M4 Max) M4 Max 36GB 1TB',
  'BSGH-MACBOOK-PR-3',
  '1TB',
  'Brand New',
  NULL,
  'M4 Max',
  '36GB',
  NULL,
  52000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m4-pro-max-1tb-m4-max-48gb-brand-new',
  'macbook-pro-16-m4-pro-max',
  'MacBook Pro 16-inch (M4 Pro / M4 Max) M4 Max 48GB 1TB',
  'BSGH-MACBOOK-PR-4',
  '1TB',
  'Brand New',
  NULL,
  'M4 Max',
  '48GB',
  NULL,
  58000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  4
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-512gb-excellent',
  'macbook-pro-14-m3',
  'MacBook Pro 14-inch (M3) 512GB (Excellent)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  21500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-1tb-excellent',
  'macbook-pro-14-m3',
  'MacBook Pro 14-inch (M3) 1TB (Excellent)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  24500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-2tb-excellent',
  'macbook-pro-14-m3',
  'MacBook Pro 14-inch (M3) 2TB (Excellent)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-pro-max-512gb-excellent',
  'macbook-pro-14-m3-pro-max',
  'MacBook Pro 14-inch (M3 Pro / M3 Max) 512GB (Excellent)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  21500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-pro-max-1tb-excellent',
  'macbook-pro-14-m3-pro-max',
  'MacBook Pro 14-inch (M3 Pro / M3 Max) 1TB (Excellent)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  24500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m3-pro-max-2tb-excellent',
  'macbook-pro-14-m3-pro-max',
  'MacBook Pro 14-inch (M3 Pro / M3 Max) 2TB (Excellent)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  27500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m3-pro-max-512gb-excellent',
  'macbook-pro-16-m3-pro-max',
  'MacBook Pro 16-inch (M3 Pro / M3 Max) 512GB (Excellent)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  28500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m3-pro-max-1tb-excellent',
  'macbook-pro-16-m3-pro-max',
  'MacBook Pro 16-inch (M3 Pro / M3 Max) 1TB (Excellent)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  31500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m3-pro-max-2tb-excellent',
  'macbook-pro-16-m3-pro-max',
  'MacBook Pro 16-inch (M3 Pro / M3 Max) 2TB (Excellent)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Excellent',
  NULL,
  NULL,
  NULL,
  NULL,
  34500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m2-256gb-very-good',
  'macbook-pro-13-m2',
  'MacBook Pro 13-inch (M2) 256GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m2-512gb-very-good',
  'macbook-pro-13-m2',
  'MacBook Pro 13-inch (M2) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  20000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m2-1tb-very-good',
  'macbook-pro-13-m2',
  'MacBook Pro 13-inch (M2) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m2-pro-max-512gb-very-good',
  'macbook-pro-14-m2-pro-max',
  'MacBook Pro 14-inch (M2 Pro / M2 Max) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  17500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m2-pro-max-1tb-very-good',
  'macbook-pro-14-m2-pro-max',
  'MacBook Pro 14-inch (M2 Pro / M2 Max) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  20000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m2-pro-max-2tb-very-good',
  'macbook-pro-14-m2-pro-max',
  'MacBook Pro 14-inch (M2 Pro / M2 Max) 2TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  22500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m2-pro-max-512gb-very-good',
  'macbook-pro-16-m2-pro-max',
  'MacBook Pro 16-inch (M2 Pro / M2 Max) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  24000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m2-pro-max-1tb-very-good',
  'macbook-pro-16-m2-pro-max',
  'MacBook Pro 16-inch (M2 Pro / M2 Max) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  26500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m2-pro-max-2tb-very-good',
  'macbook-pro-16-m2-pro-max',
  'MacBook Pro 16-inch (M2 Pro / M2 Max) 2TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  29000,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m1-256gb-very-good',
  'macbook-pro-13-m1',
  'MacBook Pro 13-inch (M1) 256GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '256GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m1-512gb-very-good',
  'macbook-pro-13-m1',
  'MacBook Pro 13-inch (M1) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  16700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-13-m1-1tb-very-good',
  'macbook-pro-13-m1',
  'MacBook Pro 13-inch (M1) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  18900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m1-pro-max-512gb-very-good',
  'macbook-pro-14-m1-pro-max',
  'MacBook Pro 14-inch (M1 Pro / M1 Max) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  14500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m1-pro-max-1tb-very-good',
  'macbook-pro-14-m1-pro-max',
  'MacBook Pro 14-inch (M1 Pro / M1 Max) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  16700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-14-m1-pro-max-2tb-very-good',
  'macbook-pro-14-m1-pro-max',
  'MacBook Pro 14-inch (M1 Pro / M1 Max) 2TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  18900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m1-pro-max-512gb-very-good',
  'macbook-pro-16-m1-pro-max',
  'MacBook Pro 16-inch (M1 Pro / M1 Max) 512GB (Very Good)',
  'BSGH-MACBOOK-PR-1',
  '512GB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  19500,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m1-pro-max-1tb-very-good',
  'macbook-pro-16-m1-pro-max',
  'MacBook Pro 16-inch (M1 Pro / M1 Max) 1TB (Very Good)',
  'BSGH-MACBOOK-PR-2',
  '1TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  21700,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'macbook-pro-16-m1-pro-max-2tb-very-good',
  'macbook-pro-16-m1-pro-max',
  'MacBook Pro 16-inch (M1 Pro / M1 Max) 2TB (Very Good)',
  'BSGH-MACBOOK-PR-3',
  '2TB',
  'Very Good',
  NULL,
  NULL,
  NULL,
  NULL,
  23900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  3
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-20w-usb-c-power-adapter-brand-new',
  'apple-20w-usb-c-power-adapter',
  'Apple 20W USB-C Power Adapter',
  'BSGH-APPLE-20W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  350,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-30w-usb-c-power-adapter-brand-new',
  'apple-30w-usb-c-power-adapter',
  'Apple 30W USB-C Power Adapter',
  'BSGH-APPLE-30W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  550,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-35w-dual-usb-c-power-adapter-brand-new',
  'apple-35w-dual-usb-c-power-adapter',
  'Apple 35W Dual USB-C Port Power Adapter',
  'BSGH-APPLE-35W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  850,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-70w-usb-c-power-adapter-brand-new',
  'apple-70w-usb-c-power-adapter',
  'Apple 70W USB-C Power Adapter',
  'BSGH-APPLE-70W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  950,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-96w-usb-c-power-adapter-brand-new',
  'apple-96w-usb-c-power-adapter',
  'Apple 96W USB-C Power Adapter',
  'BSGH-APPLE-96W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  1250,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-140w-usb-c-power-adapter-brand-new',
  'apple-140w-usb-c-power-adapter',
  'Apple 140W USB-C Power Adapter',
  'BSGH-APPLE-140W-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  1600,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magsafe-charger-brand-new',
  'apple-magsafe-charger',
  'Apple MagSafe Charger',
  'BSGH-APPLE-MAGS-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  650,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-usb-c-charge-cable-brand-new',
  'apple-usb-c-charge-cable',
  'Apple USB-C Charge Cable',
  'BSGH-APPLE-USB--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  320,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-usb-c-to-lightning-cable-brand-new',
  'apple-usb-c-to-lightning-cable',
  'Apple USB-C to Lightning Cable',
  'BSGH-APPLE-USB--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  320,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-60w-usb-c-charge-cable-brand-new',
  'apple-60w-usb-c-charge-cable',
  'Apple 60W USB-C Charge Cable',
  'BSGH-APPLE-60W--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  320,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-240w-usb-c-charge-cable-brand-new',
  'apple-240w-usb-c-charge-cable',
  'Apple 240W USB-C Charge Cable',
  'BSGH-APPLE-240W-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  480,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-usb-c-to-magsafe-3-cable-brand-new',
  'apple-usb-c-to-magsafe-3-cable',
  'Apple USB-C to MagSafe 3 Cable',
  'BSGH-APPLE-USB--1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  780,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magsafe-iphone-case-brand-new',
  'apple-magsafe-iphone-case',
  'Apple MagSafe iPhone Case',
  'BSGH-APPLE-MAGS-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  750,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-clear-iphone-case-magsafe-brand-new',
  'apple-clear-iphone-case-magsafe',
  'Apple iPhone Clear Case with MagSafe',
  'BSGH-APPLE-CLEA-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  750,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-pencil-usb-c-brand-new',
  'apple-pencil-usb-c',
  'Apple Pencil (USB-C)',
  'BSGH-APPLE-PENC-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  1250,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-pencil-pro-brand-new',
  'apple-pencil-pro',
  'Apple Pencil Pro',
  'BSGH-APPLE-PENC-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  2100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-keyboard-ipad-brand-new',
  'apple-magic-keyboard-ipad',
  'Magic Keyboard for iPad',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  4800,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-keyboard-ipad-brand-new',
  'apple-magic-keyboard-ipad',
  'Magic Keyboard for iPad',
  'BSGH-APPLE-MAGI-2',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  5400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  2
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-keyboard-folio-brand-new',
  'apple-magic-keyboard-folio',
  'Magic Keyboard Folio',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  3900,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-mouse-brand-new',
  'apple-magic-mouse',
  'Magic Mouse',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  1250,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-trackpad-brand-new',
  'apple-magic-trackpad',
  'Magic Trackpad',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  2100,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-keyboard-brand-new',
  'apple-magic-keyboard',
  'Magic Keyboard',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  1600,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-magic-keyboard-touch-id-brand-new',
  'apple-magic-keyboard-touch-id',
  'Magic Keyboard with Touch ID',
  'BSGH-APPLE-MAGI-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  2400,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)
values (
  'apple-watch-magnetic-fast-charger-usb-c-brand-new',
  'apple-watch-magnetic-fast-charger-usb-c',
  'Apple Watch Magnetic Fast Charger to USB-C Cable',
  'BSGH-APPLE-WATC-1',
  NULL,
  'Brand New',
  NULL,
  NULL,
  NULL,
  NULL,
  480,
  NULL,
  false,
  'In Stock',
  10,
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  price = excluded.price,
  previous_price = excluded.previous_price,
  is_sale = excluded.is_sale,
  storage = excluded.storage,
  condition = excluded.condition,
  screen_size = excluded.screen_size,
  chip = excluded.chip,
  memory = excluded.memory,
  connectivity = excluded.connectivity,
  position = excluded.position,
  available = excluded.available;

commit;

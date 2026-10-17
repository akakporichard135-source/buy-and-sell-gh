-- ==============================================================================
-- Migration 019: iPhone 18 Pro Variants, Pricing Harmonization & Order Resolution
-- ==============================================================================
-- 1. Harmonize iPhone 18 Pro base price from 30,000 to GH₵20,500 (256GB base price)
-- 2. Add iPhone 18 Pro Max product to catalog
-- 3. Seed product_variants for iPhone 18 Pro and iPhone 18 Pro Max (256GB, 512GB, 1TB, 2TB)
-- 4. Update homepage_content heroes and tiles secondary buttons to "Buy" (iPhone Duo keeps "View pricing")
-- 5. Harden create_order_request_validated to resolve products by id OR slug, preventing false availability errors

begin;

-- 1. Harmonize iPhone 18 Pro base product
update public.products
set price = 20500,
    name = 'iPhone 18 Pro',
    condition = 'Brand New',
    stock_quantity = 14,
    stock_status = 'In Stock',
    available = true,
    archived = false,
    updated_at = now()
where slug = 'iphone-18-pro';

-- 2. Insert iPhone 18 Pro Max if not present
insert into public.products (
  id, slug, name, brand, category, subcategory, model, description,
  price, condition, storage_options, colour_options, default_colour,
  stock_quantity, stock_status, featured, available, archived, created_at, updated_at
)
select
  'iphone-18-pro-max', 'iphone-18-pro-max', 'iPhone 18 Pro Max', 'Apple', 'iPhones', 'Flagship Pro', 'iPhone 18 Pro Max',
  'Flagship iPhone 18 Pro Max with contoured aerospace-grade titanium unibody, A19 Pro chip, and expansive Super Retina XDR display.',
  22500, 'Brand New', '["256GB", "512GB", "1TB", "2TB"]'::jsonb, '["Deep Burgundy", "Space Black", "Natural Titanium", "Light Blue"]'::jsonb, 'Deep Burgundy',
  10, 'In Stock', true, true, false, now(), now()
where not exists (select 1 from public.products where slug = 'iphone-18-pro-max');

-- 3. Seed variants for iPhone 18 Pro and Pro Max
do $$
declare
  p18_id text;
  p18m_id text;
begin
  select id into p18_id from public.products where slug = 'iphone-18-pro' limit 1;
  select id into p18m_id from public.products where slug = 'iphone-18-pro-max' limit 1;

  if p18_id is not null then
    insert into public.product_variants (id, product_id, title, sku, storage, condition, price, position, available, stock_status, stock_quantity)
    values
      (p18_id || '-256gb', p18_id, 'iPhone 18 Pro 256GB', 'BSGH-IPHONE-18P-256', '256GB', 'Brand New', 20500, 1, true, 'In Stock', 10),
      (p18_id || '-512gb', p18_id, 'iPhone 18 Pro 512GB', 'BSGH-IPHONE-18P-512', '512GB', 'Brand New', 23000, 2, true, 'In Stock', 10),
      (p18_id || '-1tb', p18_id, 'iPhone 18 Pro 1TB', 'BSGH-IPHONE-18P-1TB', '1TB', 'Brand New', 26500, 3, true, 'In Stock', 10),
      ('18p-256', p18_id, 'iPhone 18 Pro 256GB', 'BSGH-IPHONE-18P-256-FB', '256GB', 'Brand New', 20500, 1, true, 'In Stock', 10),
      ('18p-512', p18_id, 'iPhone 18 Pro 512GB', 'BSGH-IPHONE-18P-512-FB', '512GB', 'Brand New', 23000, 2, true, 'In Stock', 10),
      ('18p-1tb', p18_id, 'iPhone 18 Pro 1TB', 'BSGH-IPHONE-18P-1TB-FB', '1TB', 'Brand New', 26500, 3, true, 'In Stock', 10)
    on conflict (id) do update set
      price = excluded.price,
      product_id = excluded.product_id,
      available = excluded.available,
      stock_status = excluded.stock_status,
      stock_quantity = excluded.stock_quantity,
      updated_at = now();
  end if;

  if p18m_id is not null then
    insert into public.product_variants (id, product_id, title, sku, storage, condition, price, position, available, stock_status, stock_quantity)
    values
      (p18m_id || '-256gb', p18m_id, 'iPhone 18 Pro Max 256GB', 'BSGH-IPHONE-18PM-256', '256GB', 'Brand New', 22500, 1, true, 'In Stock', 10),
      (p18m_id || '-512gb', p18m_id, 'iPhone 18 Pro Max 512GB', 'BSGH-IPHONE-18PM-512', '512GB', 'Brand New', 25500, 2, true, 'In Stock', 10),
      (p18m_id || '-1tb', p18m_id, 'iPhone 18 Pro Max 1TB', 'BSGH-IPHONE-18PM-1TB', '1TB', 'Brand New', 28500, 3, true, 'In Stock', 10),
      (p18m_id || '-2tb', p18m_id, 'iPhone 18 Pro Max 2TB', 'BSGH-IPHONE-18PM-2TB', '2TB', 'Brand New', 32000, 4, true, 'In Stock', 10),
      ('18pm-256', p18m_id, 'iPhone 18 Pro Max 256GB', 'BSGH-IPHONE-18PM-256-FB', '256GB', 'Brand New', 22500, 1, true, 'In Stock', 10),
      ('18pm-512', p18m_id, 'iPhone 18 Pro Max 512GB', 'BSGH-IPHONE-18PM-512-FB', '512GB', 'Brand New', 25500, 2, true, 'In Stock', 10),
      ('18pm-1tb', p18m_id, 'iPhone 18 Pro Max 1TB', 'BSGH-IPHONE-18PM-1TB-FB', '1TB', 'Brand New', 28500, 3, true, 'In Stock', 10),
      ('18pm-2tb', p18m_id, 'iPhone 18 Pro Max 2TB', 'BSGH-IPHONE-18PM-2TB-FB', '2TB', 'Brand New', 32000, 4, true, 'In Stock', 10)
    on conflict (id) do update set
      price = excluded.price,
      product_id = excluded.product_id,
      available = excluded.available,
      stock_status = excluded.stock_status,
      stock_quantity = excluded.stock_quantity,
      updated_at = now();
  end if;
end $$;

-- 4. Update homepage_content heroes and tiles in Supabase
update public.homepage_content
set content = jsonb_set(
  content,
  '{heroes}',
  (
    select coalesce(
      jsonb_agg(
        case
          when hero->>'id' = 'iphone-duo' then hero
          when hero ? 'secondary' then jsonb_set(hero, '{secondary,label}', '"Buy"'::jsonb)
          else hero
        end
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(content->'heroes', '[]'::jsonb)) as hero
  )
),
updated_at = now()
where id = 'main';

update public.homepage_content
set content = jsonb_set(
  content,
  '{tiles}',
  (
    select coalesce(
      jsonb_agg(
        case
          when tile->>'id' = 'iphone-duo' then tile
          when tile ? 'secondary' then jsonb_set(tile, '{secondary,label}', '"Buy"'::jsonb)
          else tile
        end
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(coalesce(content->'tiles', '[]'::jsonb)) as tile
  )
),
updated_at = now()
where id = 'main';

-- 5. Harden create_order_request_validated
create or replace function public.create_order_request_validated(
  customer_payload jsonb,
  items_payload jsonb,
  submission_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  client_ip text;
  token_key text;
  now_ts timestamptz := clock_timestamp();
  order_row record;
  order_id uuid;
  order_ref text;
  calculated_subtotal numeric(12,2) := 0;
  product_row record;
  variant_row record;
  item_payload jsonb;
  requested_quantity integer;
  selected_storage text;
  selected_colour text;
  resolved_unit_price numeric(12,2);
  line_total numeric(12,2);
  payment_method_value text;
  delivery_method_value text;
  existing_order record;
begin
  if coalesce(trim(submission_token), '') = '' then
    raise exception 'Order submission token is required.';
  end if;

  select * into existing_order
  from public.orders
  where customer_notes like '%[submission_token:' || submission_token || ']%'
  limit 1;

  if found then
    return public.order_confirmation_json(existing_order.id);
  end if;

  if jsonb_typeof(items_payload) <> 'array' or jsonb_array_length(items_payload) = 0 then
    raise exception 'Your cart is empty. Add at least one product before submitting.';
  end if;

  payment_method_value := customer_payload ->> 'payment_method';
  delivery_method_value := customer_payload ->> 'fulfilment_type';

  if coalesce(trim(customer_payload ->> 'full_name'), '') = '' then
    raise exception 'Enter your full name.';
  end if;
  if coalesce(trim(customer_payload ->> 'phone'), '') = '' then
    raise exception 'Enter your phone number.';
  end if;
  if coalesce(trim(customer_payload ->> 'whatsapp'), '') = '' then
    raise exception 'Enter your WhatsApp number.';
  end if;
  if delivery_method_value not in ('pickup', 'delivery') then
    raise exception 'Choose delivery or pickup.';
  end if;
  if delivery_method_value = 'delivery' and coalesce(trim(customer_payload ->> 'delivery_address'), '') = '' then
    raise exception 'Enter the delivery address.';
  end if;
  if payment_method_value not in ('Pay on Pickup', 'Mobile Money on Confirmation', 'Bank Transfer on Confirmation') then
    raise exception 'Choose a valid payment preference.';
  end if;

  for item_payload in select * from jsonb_array_elements(items_payload)
  loop
    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    if requested_quantity < 1 then
      raise exception 'Choose a valid quantity for each product.';
    end if;

    -- Resolve product by id OR by slug (robust fallback for synthetic/catalog IDs)
    select * into product_row
    from public.products
    where (id = item_payload ->> 'product_id' or slug = item_payload ->> 'product_slug' or slug = item_payload ->> 'product_id')
      and archived = false
      and available = true
    order by (id = item_payload ->> 'product_id') desc, (slug = item_payload ->> 'product_slug') desc
    limit 1;

    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if product_row.stock_status in ('Sold', 'Out of Stock') or product_row.stock_quantity < requested_quantity then
      raise exception '% is no longer available in the requested quantity.', product_row.name;
    end if;

    -- Authoritative Price Resolution
    resolved_unit_price := product_row.price;
    if (item_payload ->> 'variant_id') is not null and (item_payload ->> 'variant_id') <> '' then
      select * into variant_row
      from public.product_variants
      where (id = item_payload ->> 'variant_id' or (product_id = product_row.id and storage = selected_storage and selected_storage <> ''))
        and product_id = product_row.id
        and available = true
      order by (id = item_payload ->> 'variant_id') desc, position asc
      limit 1;
      if found then
        resolved_unit_price := variant_row.price;
      end if;
    elsif selected_storage <> '' then
      select * into variant_row
      from public.product_variants
      where product_id = product_row.id
        and storage = selected_storage
        and available = true
      order by position asc
      limit 1;
      if found then
        resolved_unit_price := variant_row.price;
      end if;
    end if;

    line_total := resolved_unit_price * requested_quantity;
    calculated_subtotal := calculated_subtotal + line_total;
  end loop;

  order_ref := public.generate_order_reference();

  insert into public.orders (
    reference_number,
    customer_name,
    customer_phone,
    customer_whatsapp,
    customer_email,
    delivery_method,
    delivery_address,
    region,
    city,
    landmark,
    customer_notes,
    subtotal,
    delivery_fee,
    total_amount,
    payment_method,
    payment_status,
    order_status
  ) values (
    order_ref,
    trim(customer_payload ->> 'full_name'),
    trim(customer_payload ->> 'phone'),
    trim(customer_payload ->> 'whatsapp'),
    nullif(trim(customer_payload ->> 'email'), ''),
    delivery_method_value,
    nullif(trim(customer_payload ->> 'delivery_address'), ''),
    nullif(trim(customer_payload ->> 'region'), ''),
    nullif(trim(customer_payload ->> 'city'), ''),
    nullif(trim(customer_payload ->> 'landmark'), ''),
    concat_ws(
      E'\n\n',
      nullif(trim(customer_payload ->> 'delivery_notes'), ''),
      nullif(trim(customer_payload ->> 'additional_note'), ''),
      '[submission_token:' || submission_token || ']'
    ),
    calculated_subtotal,
    null,
    calculated_subtotal,
    payment_method_value,
    'Unpaid',
    'Pending'
  )
  returning id into order_id;

  for item_payload in select * from jsonb_array_elements(items_payload)
  loop
    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    select * into product_row
    from public.products
    where (id = item_payload ->> 'product_id' or slug = item_payload ->> 'product_slug' or slug = item_payload ->> 'product_id')
      and archived = false
      and available = true
    order by (id = item_payload ->> 'product_id') desc, (slug = item_payload ->> 'product_slug') desc
    limit 1;

    resolved_unit_price := product_row.price;
    if (item_payload ->> 'variant_id') is not null and (item_payload ->> 'variant_id') <> '' then
      select * into variant_row
      from public.product_variants
      where (id = item_payload ->> 'variant_id' or (product_id = product_row.id and storage = selected_storage and selected_storage <> ''))
        and product_id = product_row.id
        and available = true
      order by (id = item_payload ->> 'variant_id') desc, position asc
      limit 1;
      if found then
        resolved_unit_price := variant_row.price;
      end if;
    elsif selected_storage <> '' then
      select * into variant_row
      from public.product_variants
      where product_id = product_row.id
        and storage = selected_storage
        and available = true
      order by position asc
      limit 1;
      if found then
        resolved_unit_price := variant_row.price;
      end if;
    end if;

    line_total := resolved_unit_price * requested_quantity;

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      selected_storage,
      selected_colour,
      selected_condition,
      battery_health,
      warranty,
      product_image,
      quantity,
      unit_price,
      line_total
    ) values (
      order_id,
      product_row.id,
      product_row.name,
      product_row.slug,
      selected_storage,
      selected_colour,
      product_row.condition,
      product_row.battery_health,
      product_row.warranty,
      coalesce(product_row.images->0->>'src', ''),
      requested_quantity,
      resolved_unit_price,
      line_total
    );

    update public.products
    set stock_quantity = greatest(0, stock_quantity - requested_quantity),
        stock_status = case
          when stock_quantity - requested_quantity <= 0 then 'Out of Stock'::public.stock_status_enum
          when stock_quantity - requested_quantity <= 2 then 'Low Stock'::public.stock_status_enum
          else stock_status
        end,
        updated_at = now()
    where id = product_row.id;
  end loop;

  return public.order_confirmation_json(order_id);
end;
$$;

commit;

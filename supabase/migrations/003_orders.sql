-- Buy & Sell GH production order request system.
-- Run after 001_product_catalog.sql and 002_align_product_catalog_checks.sql.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  client_submission_token text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_whatsapp text not null,
  delivery_method text not null check (delivery_method in ('pickup', 'delivery')),
  delivery_address text,
  region text,
  city text,
  landmark text,
  delivery_notes text,
  customer_notes text,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_fee numeric(12,2) check (delivery_fee is null or delivery_fee >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  payment_method text not null check (payment_method in ('Pay on Pickup', 'Mobile Money on Confirmation', 'Bank Transfer on Confirmation')),
  payment_status text not null default 'Unpaid' check (payment_status in ('Unpaid', 'Pending', 'Paid', 'Failed', 'Refunded')),
  order_status text not null default 'Pending' check (order_status in ('Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_image text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  selected_storage text not null,
  selected_colour text not null,
  selected_condition text not null,
  battery_health text,
  warranty text,
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_reference_number_idx on public.orders (reference_number);
create index if not exists orders_status_created_idx on public.orders (order_status, created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_customer_phone_idx on public.orders (customer_phone);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items for select
to authenticated
using (public.is_admin());

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

create or replace function public.create_order_request(
  customer_payload jsonb,
  items_payload jsonb,
  submission_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order public.orders%rowtype;
  new_order public.orders%rowtype;
  item_payload jsonb;
  product_row public.products%rowtype;
  requested_quantity integer;
  selected_storage text;
  selected_colour text;
  line_total numeric(12,2);
  calculated_subtotal numeric(12,2) := 0;
  payment_method_value text;
  delivery_method_value text;
begin
  if submission_token is null or length(trim(submission_token)) < 12 then
    raise exception 'Invalid order submission. Please refresh and try again.';
  end if;

  select * into existing_order
  from public.orders
  where client_submission_token = submission_token;

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

    select * into product_row
    from public.products
    where id = item_payload ->> 'product_id'
      and slug = item_payload ->> 'product_slug'
      and archived = false
      and available = true;

    if not found then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if product_row.stock_status in ('Sold', 'Out of Stock') or product_row.stock_quantity < requested_quantity then
      raise exception '% is no longer available in the requested quantity.', product_row.name;
    end if;
    if selected_storage = '' or not (product_row.storage_options ? selected_storage) then
      raise exception 'Selected storage is not available for %.', product_row.name;
    end if;
    if selected_colour = '' or not (product_row.colour_options ? selected_colour) then
      raise exception 'Selected colour is not available for %.', product_row.name;
    end if;

    line_total := product_row.price * requested_quantity;
    calculated_subtotal := calculated_subtotal + line_total;
  end loop;

  insert into public.orders (
    reference_number,
    client_submission_token,
    customer_name,
    customer_email,
    customer_phone,
    customer_whatsapp,
    delivery_method,
    delivery_address,
    region,
    city,
    landmark,
    delivery_notes,
    customer_notes,
    subtotal,
    delivery_fee,
    total_amount,
    payment_method,
    payment_status,
    order_status
  ) values (
    public.generate_order_reference(),
    submission_token,
    trim(customer_payload ->> 'full_name'),
    nullif(trim(coalesce(customer_payload ->> 'email', '')), ''),
    trim(customer_payload ->> 'phone'),
    trim(customer_payload ->> 'whatsapp'),
    delivery_method_value,
    nullif(trim(coalesce(customer_payload ->> 'delivery_address', '')), ''),
    nullif(trim(coalesce(customer_payload ->> 'region', '')), ''),
    nullif(trim(coalesce(customer_payload ->> 'city', '')), ''),
    nullif(trim(coalesce(customer_payload ->> 'landmark', '')), ''),
    nullif(trim(coalesce(customer_payload ->> 'delivery_notes', '')), ''),
    nullif(trim(coalesce(customer_payload ->> 'additional_note', '')), ''),
    calculated_subtotal,
    null,
    calculated_subtotal,
    payment_method_value,
    'Unpaid',
    'Pending'
  )
  returning * into new_order;

  for item_payload in select * from jsonb_array_elements(items_payload)
  loop
    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    select * into product_row
    from public.products
    where id = item_payload ->> 'product_id'
      and slug = item_payload ->> 'product_slug';

    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      product_slug,
      product_image,
      quantity,
      unit_price,
      selected_storage,
      selected_colour,
      selected_condition,
      battery_health,
      warranty,
      line_total
    ) values (
      new_order.id,
      product_row.id,
      product_row.name,
      product_row.slug,
      coalesce(product_row.images -> product_row.primary_image ->> 'src', product_row.images -> 0 ->> 'src', ''),
      requested_quantity,
      product_row.price,
      selected_storage,
      selected_colour,
      product_row.condition,
      product_row.battery_health,
      product_row.warranty,
      product_row.price * requested_quantity
    );
  end loop;

  return public.order_confirmation_json(new_order.id);
end;
$$;

create or replace function public.order_confirmation_json(order_id_input uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'reference_number', o.reference_number,
    'customer_name', o.customer_name,
    'customer_email', o.customer_email,
    'customer_phone', o.customer_phone,
    'customer_whatsapp', o.customer_whatsapp,
    'delivery_method', o.delivery_method,
    'delivery_address', o.delivery_address,
    'region', o.region,
    'city', o.city,
    'landmark', o.landmark,
    'customer_notes', o.customer_notes,
    'subtotal', o.subtotal,
    'delivery_fee', o.delivery_fee,
    'total_amount', o.total_amount,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'order_status', o.order_status,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'items', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'product_id', oi.product_id,
          'product_slug', oi.product_slug,
          'product_name', oi.product_name,
          'product_image', oi.product_image,
          'selected_storage', oi.selected_storage,
          'selected_colour', oi.selected_colour,
          'selected_condition', oi.selected_condition,
          'battery_health', oi.battery_health,
          'warranty', oi.warranty,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price,
          'line_total', oi.line_total
        )
        order by oi.created_at
      ) filter (where oi.id is not null),
      '[]'::jsonb
    )
  )
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  where o.id = order_id_input
  group by o.id;
$$;

revoke all on function public.create_order_request(jsonb, jsonb, text) from public;
revoke all on function public.generate_order_reference() from public;
revoke all on function public.order_confirmation_json(uuid) from public;
grant execute on function public.create_order_request(jsonb, jsonb, text) to anon, authenticated;
grant execute on function public.order_confirmation_json(uuid) to authenticated;

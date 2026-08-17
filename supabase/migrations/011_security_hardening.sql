-- Security hardening for admin authorization and public order requests.
-- Review and run manually after 010_expand_accessories_catalog.sql.
-- This migration does not change catalogue, customer, order, or admin-profile data.

begin;

-- SECURITY DEFINER helpers keep all referenced schemas explicit so caller-controlled
-- objects cannot be resolved through the search path.
alter function public.is_admin() set search_path = '';
alter function public.is_owner() set search_path = '';
alter function public.generate_order_reference() set search_path = '';
alter function public.create_order_request(jsonb, jsonb, text) set search_path = '';
alter function public.order_confirmation_json(uuid) set search_path = '';

-- The confirmation formatter is an internal helper. Admin screens read through
-- RLS-protected tables, so no browser role needs to execute it directly.
alter function public.order_confirmation_json(uuid) security invoker;
revoke all on function public.order_confirmation_json(uuid) from public, anon, authenticated;

-- The reference generator is called only by create_order_request.
revoke all on function public.generate_order_reference() from public, anon, authenticated;

-- Keep order creation available through the controlled RPC only.
revoke all on function public.create_order_request(jsonb, jsonb, text) from public;
grant execute on function public.create_order_request(jsonb, jsonb, text) to anon, authenticated;

-- RLS already limits updates to admin_profiles members. Column privileges add
-- defence in depth so a compromised admin browser cannot rewrite customer or total fields.
revoke insert, update, delete on table public.orders from anon;
revoke insert, delete on table public.orders from authenticated;
revoke update on table public.orders from authenticated;
grant update (order_status, payment_status, admin_note) on table public.orders to authenticated;

-- Order items are immutable snapshots created only by create_order_request.
revoke insert, update, delete on table public.order_items from anon, authenticated;

-- Bound stored public input. NOT VALID preserves existing rows while enforcing the
-- constraints for all new inserts and updates after this migration is applied.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_submission_token_length_check'
  ) then
    alter table public.orders
      add constraint orders_submission_token_length_check
      check (char_length(client_submission_token) between 12 and 128) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_customer_identity_length_check'
  ) then
    alter table public.orders
      add constraint orders_customer_identity_length_check
      check (
        char_length(customer_name) between 1 and 120
        and char_length(customer_phone) between 7 and 32
        and char_length(customer_whatsapp) between 7 and 32
        and (customer_email is null or char_length(customer_email) <= 254)
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_customer_text_length_check'
  ) then
    alter table public.orders
      add constraint orders_customer_text_length_check
      check (
        (delivery_address is null or char_length(delivery_address) <= 500)
        and (region is null or char_length(region) <= 100)
        and (city is null or char_length(city) <= 120)
        and (landmark is null or char_length(landmark) <= 200)
        and (delivery_notes is null or char_length(delivery_notes) <= 2000)
        and (customer_notes is null or char_length(customer_notes) <= 2000)
        and char_length(admin_note) <= 4000
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.order_items'::regclass
      and conname = 'order_items_snapshot_length_check'
  ) then
    alter table public.order_items
      add constraint order_items_snapshot_length_check
      check (
        char_length(product_name) between 1 and 200
        and char_length(product_slug) between 1 and 200
        and (product_image is null or char_length(product_image) <= 2048)
        and char_length(selected_storage) <= 160
        and char_length(selected_colour) <= 160
        and char_length(selected_condition) <= 80
        and (battery_health is null or char_length(battery_health) <= 160)
        and (warranty is null or char_length(warranty) <= 500)
      ) not valid;
  end if;
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
set search_path = ''
as $$
declare
  existing_order public.orders%rowtype;
  new_order public.orders%rowtype;
  item_payload jsonb;
  product_row public.products%rowtype;
  requested_quantity integer;
  product_requested_total integer;
  requested_by_product jsonb := '{}'::jsonb;
  selected_storage text;
  selected_colour text;
  line_total numeric(12,2);
  calculated_subtotal numeric(12,2) := 0;
  payment_method_value text;
  delivery_method_value text;
begin
  if submission_token is null
    or char_length(trim(submission_token)) < 12
    or char_length(trim(submission_token)) > 128 then
    raise exception 'Invalid order submission. Please refresh and try again.';
  end if;

  select * into existing_order
  from public.orders
  where client_submission_token = trim(submission_token);

  if found then
    return public.order_confirmation_json(existing_order.id);
  end if;

  if coalesce(jsonb_typeof(customer_payload), 'null') <> 'object' then
    raise exception 'Enter valid customer details.';
  end if;
  if coalesce(jsonb_typeof(items_payload), 'null') <> 'array'
    or jsonb_array_length(items_payload) = 0 then
    raise exception 'Your cart is empty. Add at least one product before submitting.';
  end if;
  if jsonb_array_length(items_payload) > 25 then
    raise exception 'Too many cart lines. Submit no more than 25 products at a time.';
  end if;

  payment_method_value := customer_payload ->> 'payment_method';
  delivery_method_value := customer_payload ->> 'fulfilment_type';

  if coalesce(trim(customer_payload ->> 'full_name'), '') = '' then
    raise exception 'Enter your full name.';
  end if;
  if char_length(trim(customer_payload ->> 'full_name')) > 120 then
    raise exception 'Full name is too long.';
  end if;
  if coalesce(trim(customer_payload ->> 'phone'), '') = '' then
    raise exception 'Enter your phone number.';
  end if;
  if char_length(trim(customer_payload ->> 'phone')) > 32 then
    raise exception 'Phone number is too long.';
  end if;
  if coalesce(trim(customer_payload ->> 'whatsapp'), '') = '' then
    raise exception 'Enter your WhatsApp number.';
  end if;
  if char_length(trim(customer_payload ->> 'whatsapp')) > 32 then
    raise exception 'WhatsApp number is too long.';
  end if;
  if char_length(trim(coalesce(customer_payload ->> 'email', ''))) > 254 then
    raise exception 'Email address is too long.';
  end if;
  if delivery_method_value not in ('pickup', 'delivery') then
    raise exception 'Choose delivery or pickup.';
  end if;
  if delivery_method_value = 'delivery'
    and coalesce(trim(customer_payload ->> 'delivery_address'), '') = '' then
    raise exception 'Enter the delivery address.';
  end if;
  if char_length(trim(coalesce(customer_payload ->> 'delivery_address', ''))) > 500
    or char_length(trim(coalesce(customer_payload ->> 'region', ''))) > 100
    or char_length(trim(coalesce(customer_payload ->> 'city', ''))) > 120
    or char_length(trim(coalesce(customer_payload ->> 'landmark', ''))) > 200
    or char_length(trim(coalesce(customer_payload ->> 'delivery_notes', ''))) > 2000
    or char_length(trim(coalesce(customer_payload ->> 'additional_note', ''))) > 2000 then
    raise exception 'One or more delivery or note fields are too long.';
  end if;
  if payment_method_value not in ('Pay on Pickup', 'Mobile Money on Confirmation', 'Bank Transfer on Confirmation') then
    raise exception 'Choose a valid payment preference.';
  end if;

  for item_payload in select * from jsonb_array_elements(items_payload)
  loop
    if coalesce(jsonb_typeof(item_payload), 'null') <> 'object' then
      raise exception 'Choose valid products for your order.';
    end if;
    if coalesce(item_payload ->> 'quantity', '') !~ '^[1-9][0-9]{0,2}$' then
      raise exception 'Choose a valid quantity for each product.';
    end if;

    requested_quantity := (item_payload ->> 'quantity')::integer;
    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));
    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));

    if char_length(coalesce(item_payload ->> 'product_id', '')) > 200
      or char_length(coalesce(item_payload ->> 'product_slug', '')) > 200
      or char_length(selected_storage) > 160
      or char_length(selected_colour) > 160 then
      raise exception 'A product selection is invalid.';
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
    if product_row.price_on_request or product_row.price <= 0 then
      raise exception '% requires price confirmation and cannot be submitted through checkout.', product_row.name;
    end if;

    product_requested_total := coalesce((requested_by_product ->> product_row.id)::integer, 0) + requested_quantity;
    if product_row.stock_status in ('Sold', 'Out of Stock')
      or product_row.stock_quantity < product_requested_total then
      raise exception '% is no longer available in the requested quantity.', product_row.name;
    end if;
    requested_by_product := jsonb_set(
      requested_by_product,
      array[product_row.id],
      to_jsonb(product_requested_total),
      true
    );

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
    trim(submission_token),
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
    requested_quantity := (item_payload ->> 'quantity')::integer;
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

revoke all on function public.create_order_request(jsonb, jsonb, text) from public;
grant execute on function public.create_order_request(jsonb, jsonb, text) to anon, authenticated;

commit;

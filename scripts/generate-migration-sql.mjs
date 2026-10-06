import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sqlEscape(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return val.toString();
  if (typeof val === "boolean") return val ? "true" : "false";
  return `'${String(val).replace(/'/g, "''")}'`;
}

const raw = await readFile(path.resolve("scripts/proposed-pricing.json"), "utf8");
const products = JSON.parse(raw);

// -------------------------------------------------------------
// 1. Generate 013_product_variants_schema.sql
// -------------------------------------------------------------
const schemaLines = [
  "-- Migration: 013_product_variants_schema.sql",
  "-- Production database schema for Buy & Sell GH product variants and dynamic configuration pricing.",
  "-- Contains table definition, constraints, indexes, triggers, RLS policies, and order price resolution.",
  "",
  "begin;",
  "",
  "-- 1. Create product_variants table",
  "create table if not exists public.product_variants (",
  "  id text primary key,",
  "  product_id text not null references public.products(id) on delete cascade,",
  "  title text not null,",
  "  sku text,",
  "  storage text,",
  "  condition text not null default 'Brand New',",
  "  screen_size text,",
  "  chip text,",
  "  memory text,",
  "  connectivity text,",
  "  finish text,",
  "  glass text,",
  "  price numeric(12,2) not null check (price >= 0),",
  "  previous_price numeric(12,2) check (previous_price is null or previous_price >= 0),",
  "  is_sale boolean not null default false,",
  "  stock_status text not null default 'In Stock' check (stock_status in ('In Stock', 'Low Stock', 'Out of Stock', 'Sold')),",
  "  stock_quantity integer not null default 10 check (stock_quantity >= 0),",
  "  available boolean not null default true,",
  "  position integer not null default 0,",
  "  created_at timestamptz not null default now(),",
  "  updated_at timestamptz not null default now()",
  ");",
  "",
  "-- 2. Performance Indexes",
  "create index if not exists product_variants_product_id_idx on public.product_variants (product_id, available, position);",
  "create index if not exists product_variants_sku_idx on public.product_variants (sku);",
  "create index if not exists product_variants_price_idx on public.product_variants (price);",
  "",
  "-- 3. Updated At Trigger",
  "drop trigger if exists set_product_variants_updated_at on public.product_variants;",
  "create trigger set_product_variants_updated_at",
  "before update on public.product_variants",
  "for each row execute function public.set_updated_at();",
  "",
  "-- 4. Row Level Security & Access Grants",
  "alter table public.product_variants enable row level security;",
  "",
  "-- Public read-only access to available storefront variants",
  "drop policy if exists \"Public can view active product variants\" on public.product_variants;",
  "create policy \"Public can view active product variants\"",
  "on public.product_variants for select",
  "to anon, authenticated",
  "using (available = true);",
  "",
  "-- Authenticated administrators with valid AAL2 session can manage variants",
  "drop policy if exists \"Admins can manage product variants\" on public.product_variants;",
  "create policy \"Admins can manage product variants\"",
  "on public.product_variants for all",
  "to authenticated",
  "using (public.is_admin())",
  "with check (public.is_admin());",
  "",
  "grant select on table public.product_variants to anon, authenticated;",
  "revoke insert, update, delete on table public.product_variants from anon;",
  "",
  "-- 5. Order Request Resolution: Authoritative Server-Side Variant Pricing",
  "-- Extend create_order_request to resolve variant prices authoritatively from product_variants",
  "create or replace function public.create_order_request(",
  "  customer_payload jsonb,",
  "  items_payload jsonb,",
  "  submission_token text",
  ")",
  "returns jsonb",
  "language plpgsql",
  "security definer",
  "set search_path = public, extensions",
  "as $$",
  "declare",
  "  existing_order public.orders%rowtype;",
  "  new_order public.orders%rowtype;",
  "  item_payload jsonb;",
  "  product_row public.products%rowtype;",
  "  variant_row public.product_variants%rowtype;",
  "  requested_quantity integer;",
  "  selected_storage text;",
  "  selected_colour text;",
  "  resolved_unit_price numeric(12,2);",
  "  line_total numeric(12,2);",
  "  calculated_subtotal numeric(12,2) := 0;",
  "  payment_method_value text;",
  "  delivery_method_value text;",
  "begin",
  "  if submission_token is null or length(trim(submission_token)) < 12 then",
  "    raise exception 'Invalid order submission. Please refresh and try again.';",
  "  end if;",
  "",
  "  select * into existing_order",
  "  from public.orders",
  "  where client_submission_token = submission_token;",
  "",
  "  if found then",
  "    return public.order_confirmation_json(existing_order.id);",
  "  end if;",
  "",
  "  if jsonb_typeof(items_payload) <> 'array' or jsonb_array_length(items_payload) = 0 then",
  "    raise exception 'Your cart is empty. Add at least one product before submitting.';",
  "  end if;",
  "",
  "  payment_method_value := customer_payload ->> 'payment_method';",
  "  delivery_method_value := customer_payload ->> 'fulfilment_type';",
  "",
  "  if coalesce(trim(customer_payload ->> 'full_name'), '') = '' then",
  "    raise exception 'Enter your full name.';",
  "  end if;",
  "  if coalesce(trim(customer_payload ->> 'phone'), '') = '' then",
  "    raise exception 'Enter your phone number.';",
  "  end if;",
  "  if coalesce(trim(customer_payload ->> 'whatsapp'), '') = '' then",
  "    raise exception 'Enter your WhatsApp number.';",
  "  end if;",
  "  if delivery_method_value not in ('pickup', 'delivery') then",
  "    raise exception 'Choose delivery or pickup.';",
  "  end if;",
  "  if delivery_method_value = 'delivery' and coalesce(trim(customer_payload ->> 'delivery_address'), '') = '' then",
  "    raise exception 'Enter the delivery address.';",
  "  end if;",
  "  if payment_method_value not in ('Pay on Pickup', 'Mobile Money on Confirmation', 'Bank Transfer on Confirmation') then",
  "    raise exception 'Choose a valid payment preference.';",
  "  end if;",
  "",
  "  for item_payload in select * from jsonb_array_elements(items_payload)",
  "  loop",
  "    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));",
  "    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));",
  "    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));",
  "",
  "    if requested_quantity < 1 then",
  "      raise exception 'Choose a valid quantity for each product.';",
  "    end if;",
  "",
  "    select * into product_row",
  "    from public.products",
  "    where id = item_payload ->> 'product_id'",
  "      and slug = item_payload ->> 'product_slug'",
  "      and archived = false",
  "      and available = true;",
  "",
  "    if not found then",
  "      raise exception 'A product in your cart is no longer available.';",
  "    end if;",
  "    if product_row.stock_status in ('Sold', 'Out of Stock') or product_row.stock_quantity < requested_quantity then",
  "      raise exception '% is no longer available in the requested quantity.', product_row.name;",
  "    end if;",
  "",
  "    -- Authoritative Price Resolution:",
  "    -- Check if a specific variant matches by variant_id or by product_id + storage",
  "    resolved_unit_price := product_row.price;",
  "    if (item_payload ->> 'variant_id') is not null and (item_payload ->> 'variant_id') <> '' then",
  "      select * into variant_row",
  "      from public.product_variants",
  "      where id = item_payload ->> 'variant_id'",
  "        and product_id = product_row.id",
  "        and available = true;",
  "      if found then",
  "        resolved_unit_price := variant_row.price;",
  "      end if;",
  "    elsif selected_storage <> '' then",
  "      select * into variant_row",
  "      from public.product_variants",
  "      where product_id = product_row.id",
  "        and storage = selected_storage",
  "        and available = true",
  "      order by position asc",
  "      limit 1;",
  "      if found then",
  "        resolved_unit_price := variant_row.price;",
  "      end if;",
  "    end if;",
  "",
  "    line_total := resolved_unit_price * requested_quantity;",
  "    calculated_subtotal := calculated_subtotal + line_total;",
  "  end loop;",
  "",
  "  insert into public.orders (",
  "    reference_number,",
  "    client_submission_token,",
  "    customer_name,",
  "    customer_email,",
  "    customer_phone,",
  "    customer_whatsapp,",
  "    delivery_method,",
  "    delivery_address,",
  "    region,",
  "    city,",
  "    landmark,",
  "    delivery_notes,",
  "    customer_notes,",
  "    subtotal,",
  "    delivery_fee,",
  "    total_amount,",
  "    payment_method,",
  "    payment_status,",
  "    order_status",
  "  ) values (",
  "    public.generate_order_reference(),",
  "    submission_token,",
  "    trim(customer_payload ->> 'full_name'),",
  "    nullif(trim(coalesce(customer_payload ->> 'email', '')), ''),",
  "    trim(customer_payload ->> 'phone'),",
  "    trim(customer_payload ->> 'whatsapp'),",
  "    delivery_method_value,",
  "    case when delivery_method_value = 'delivery' then trim(customer_payload ->> 'delivery_address') else null end,",
  "    case when delivery_method_value = 'delivery' then nullif(trim(coalesce(customer_payload ->> 'region', '')), '') else null end,",
  "    case when delivery_method_value = 'delivery' then nullif(trim(coalesce(customer_payload ->> 'city', '')), '') else null end,",
  "    case when delivery_method_value = 'delivery' then nullif(trim(coalesce(customer_payload ->> 'landmark', '')), '') else null end,",
  "    case when delivery_method_value = 'delivery' then nullif(trim(coalesce(customer_payload ->> 'delivery_notes', '')), '') else null end,",
  "    nullif(trim(coalesce(customer_payload ->> 'additional_note', '')), ''),",
  "    calculated_subtotal,",
  "    null,",
  "    calculated_subtotal,",
  "    payment_method_value,",
  "    'Pending Verification',",
  "    'Pending'",
  "  ) returning * into new_order;",
  "",
  "  for item_payload in select * from jsonb_array_elements(items_payload)",
  "  loop",
  "    requested_quantity := greatest(0, coalesce((item_payload ->> 'quantity')::integer, 0));",
  "    selected_storage := trim(coalesce(item_payload ->> 'selected_storage', ''));",
  "    selected_colour := trim(coalesce(item_payload ->> 'selected_colour', ''));",
  "",
  "    select * into product_row",
  "    from public.products",
  "    where id = item_payload ->> 'product_id';",
  "",
  "    resolved_unit_price := product_row.price;",
  "    if (item_payload ->> 'variant_id') is not null and (item_payload ->> 'variant_id') <> '' then",
  "      select * into variant_row",
  "      from public.product_variants",
  "      where id = item_payload ->> 'variant_id'",
  "        and product_id = product_row.id",
  "        and available = true;",
  "      if found then",
  "        resolved_unit_price := variant_row.price;",
  "      end if;",
  "    elsif selected_storage <> '' then",
  "      select * into variant_row",
  "      from public.product_variants",
  "      where product_id = product_row.id",
  "        and storage = selected_storage",
  "        and available = true",
  "      order by position asc",
  "      limit 1;",
  "      if found then",
  "        resolved_unit_price := variant_row.price;",
  "      end if;",
  "    end if;",
  "",
  "    line_total := resolved_unit_price * requested_quantity;",
  "",
  "    insert into public.order_items (",
  "      order_id,",
  "      product_id,",
  "      product_slug,",
  "      product_name,",
  "      product_image,",
  "      selected_storage,",
  "      selected_colour,",
  "      selected_condition,",
  "      battery_health,",
  "      warranty,",
  "      quantity,",
  "      unit_price,",
  "      line_total",
  "    ) values (",
  "      new_order.id,",
  "      product_row.id,",
  "      product_row.slug,",
  "      product_row.name,",
  "      coalesce(product_row.images -> 0 ->> 'src', ''),",
  "      selected_storage,",
  "      selected_colour,",
  "      product_row.condition,",
  "      product_row.battery_health,",
  "      product_row.warranty,",
  "      requested_quantity,",
  "      resolved_unit_price,",
  "      line_total",
  "    );",
  "  end loop;",
  "",
  "  return public.order_confirmation_json(new_order.id);",
  "end;",
  "$$;",
  "",
  "commit;",
  ""
];

// -------------------------------------------------------------
// 2. Generate 014_seed_product_variants_pricing.sql
// -------------------------------------------------------------
const computedTotalVariants = products.reduce((acc, p) => acc + (p.variants ? p.variants.length : 0), 0);

const seedLines = [
  "-- Migration: 014_seed_product_variants_pricing.sql",
  "-- Initial pricing dataset for Buy & Sell GH.",
  `-- Contains base price updates for all ${products.length} products and seed records for all ${computedTotalVariants} configuration variants.`,
  "-- Future price adjustments should be performed directly via the Admin Dashboard.",
  "",
  "begin;",
  "",
  "-- 1. Update Base Product Selling Prices",
];

for (const p of products) {
  const basePrice = p.proposedBaseGhs || 0;
  const priceOnRequest = basePrice <= 0;
  seedLines.push(
    `update public.products set price = ${basePrice}, price_on_request = ${priceOnRequest ? "true" : "false"} where id = ${sqlEscape(p.id)};`
  );
}

seedLines.push("");
seedLines.push("-- 2. Upsert Initial Product Configuration Variants");

let totalVariants = 0;

for (const p of products) {
  const vars = p.variants || [];
  let pos = 0;
  for (const v of vars) {
    pos += 1;
    totalVariants += 1;
    const parts = [
      p.id,
      v.storage ? slugify(v.storage) : "",
      v.chip ? slugify(v.chip) : "",
      v.memory ? slugify(v.memory) : "",
      v.screenSize ? slugify(v.screenSize) : "",
      v.connectivity ? slugify(v.connectivity) : "",
      v.condition ? slugify(v.condition) : "brand-new"
    ].filter(Boolean);

    const variantId = parts.join("-");
    const sku = `BSGH-${p.id.toUpperCase().slice(0, 10)}-${pos}`;

    const titleParts = [p.name];
    if (v.screenSize) titleParts.push(v.screenSize);
    if (v.chip) titleParts.push(v.chip);
    if (v.memory) titleParts.push(v.memory);
    if (v.storage) titleParts.push(v.storage);
    if (v.connectivity) titleParts.push(v.connectivity);
    if (v.condition && v.condition !== "Brand New") titleParts.push(`(${v.condition})`);
    const title = titleParts.join(" ");

    const isSale = Boolean(v.previousPrice && v.previousPrice > v.price);

    seedLines.push(
      `insert into public.product_variants (id, product_id, title, sku, storage, condition, screen_size, chip, memory, connectivity, price, previous_price, is_sale, stock_status, stock_quantity, available, position)`,
      `values (`,
      `  ${sqlEscape(variantId)},`,
      `  ${sqlEscape(p.id)},`,
      `  ${sqlEscape(title)},`,
      `  ${sqlEscape(sku)},`,
      `  ${sqlEscape(v.storage || null)},`,
      `  ${sqlEscape(v.condition || "Brand New")},`,
      `  ${sqlEscape(v.screenSize || null)},`,
      `  ${sqlEscape(v.chip || null)},`,
      `  ${sqlEscape(v.memory || null)},`,
      `  ${sqlEscape(v.connectivity || null)},`,
      `  ${v.price},`,
      `  ${sqlEscape(v.previousPrice || null)},`,
      `  ${isSale ? "true" : "false"},`,
      `  'In Stock',`,
      `  10,`,
      `  true,`,
      `  ${pos}`,
      `)`,
      `on conflict (id) do update set`,
      `  title = excluded.title,`,
      `  price = excluded.price,`,
      `  previous_price = excluded.previous_price,`,
      `  is_sale = excluded.is_sale,`,
      `  storage = excluded.storage,`,
      `  condition = excluded.condition,`,
      `  screen_size = excluded.screen_size,`,
      `  chip = excluded.chip,`,
      `  memory = excluded.memory,`,
      `  connectivity = excluded.connectivity,`,
      `  position = excluded.position,`,
      `  available = excluded.available;`,
      ""
    );
  }
}

seedLines.push("commit;");
seedLines.push("");

const schemaPath = path.resolve("supabase/migrations/013_product_variants_schema.sql");
const seedPath = path.resolve("supabase/migrations/014_seed_product_variants_pricing.sql");

await writeFile(schemaPath, schemaLines.join("\n"), "utf8");
await writeFile(seedPath, seedLines.join("\n"), "utf8");

console.log(`Generated Schema: ${schemaPath}`);
console.log(`Generated Seed (${products.length} products, ${totalVariants} variants): ${seedPath}`);

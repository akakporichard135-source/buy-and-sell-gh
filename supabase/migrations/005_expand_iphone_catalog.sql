-- Expand the public iPhone catalogue without inventing price, stock, or condition data.
-- Existing product business fields are preserved. New enquiry-only models remain
-- unavailable for direct purchase until the owner configures real inventory.

begin;

alter table public.products
  drop constraint if exists products_condition_check;

alter table public.products
  add constraint products_condition_check
  check (condition in ('Brand New', 'UK Used', 'Excellent', 'Very Good', 'To Confirm'));

-- Normalize catalogue classification only. Existing commercial fields, images, and availability flags are untouched.
update public.products as product
set
  category = 'iPhones',
  generation = expected.generation
from (
  values
    ('iphone-11-pro-max', 'iPhone 11'),
    ('iphone-12-pro-max', 'iPhone 12'),
    ('iphone-13-pro-max', 'iPhone 13'),
    ('iphone-14-pro-max', 'iPhone 14'),
    ('iphone-15', 'iPhone 15'),
    ('iphone-15-pro-max', 'iPhone 15'),
    ('iphone-16-pro', 'iPhone 16'),
    ('iphone-16-pro-max', 'iPhone 16')
) as expected(slug, generation)
where product.slug = expected.slug;

with missing_models as (
  select *
  from jsonb_to_recordset($catalogue$
  [
    {
      "slug": "iphone-12-mini",
      "name": "iPhone 12 mini",
      "generation": "iPhone 12",
      "storage": ["64GB", "128GB", "256GB"],
      "colours": ["Black", "White", "Red", "Green", "Blue", "Purple"],
      "specifications": ["5.4-inch Super Retina XDR display", "A14 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 12 mini", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-12",
      "name": "iPhone 12",
      "generation": "iPhone 12",
      "storage": ["64GB", "128GB", "256GB"],
      "colours": ["Black", "White", "Red", "Green", "Blue", "Purple"],
      "specifications": ["6.1-inch Super Retina XDR display", "A14 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 12", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-12-pro",
      "name": "iPhone 12 Pro",
      "generation": "iPhone 12",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Silver", "Graphite", "Gold", "Pacific Blue"],
      "specifications": ["6.1-inch Super Retina XDR display", "A14 Bionic chip", "Pro camera system", "Lightning connector"],
      "included_items": ["iPhone 12 Pro", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-13-mini",
      "name": "iPhone 13 mini",
      "generation": "iPhone 13",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Pink", "Blue", "Midnight", "Starlight", "Red", "Green"],
      "specifications": ["5.4-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 13 mini", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-13",
      "name": "iPhone 13",
      "generation": "iPhone 13",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Pink", "Blue", "Midnight", "Starlight", "Red", "Green"],
      "specifications": ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 13", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-13-pro",
      "name": "iPhone 13 Pro",
      "generation": "iPhone 13",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
      "specifications": ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Pro camera system", "Lightning connector"],
      "included_items": ["iPhone 13 Pro", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-14",
      "name": "iPhone 14",
      "generation": "iPhone 14",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Midnight", "Purple", "Starlight", "Red", "Blue", "Yellow"],
      "specifications": ["6.1-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 14", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-14-plus",
      "name": "iPhone 14 Plus",
      "generation": "iPhone 14",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Midnight", "Purple", "Starlight", "Red", "Blue", "Yellow"],
      "specifications": ["6.7-inch Super Retina XDR display", "A15 Bionic chip", "Dual camera system", "Lightning connector"],
      "included_items": ["iPhone 14 Plus", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-14-pro",
      "name": "iPhone 14 Pro",
      "generation": "iPhone 14",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Space Black", "Silver", "Gold", "Deep Purple"],
      "specifications": ["6.1-inch Super Retina XDR display", "A16 Bionic chip", "Pro camera system", "Lightning connector"],
      "included_items": ["iPhone 14 Pro", "USB-C to Lightning cable", "Documentation"]
    },
    {
      "slug": "iphone-15-plus",
      "name": "iPhone 15 Plus",
      "generation": "iPhone 15",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Black", "Blue", "Green", "Yellow", "Pink"],
      "specifications": ["6.7-inch Super Retina XDR display", "A16 Bionic chip", "Dual camera system", "USB-C charging"],
      "included_items": ["iPhone 15 Plus", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-15-pro",
      "name": "iPhone 15 Pro",
      "generation": "iPhone 15",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"],
      "specifications": ["6.1-inch Super Retina XDR display", "A17 Pro chip", "Pro camera system", "USB-C charging"],
      "included_items": ["iPhone 15 Pro", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-16e",
      "name": "iPhone 16e",
      "generation": "iPhone 16",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Black", "White"],
      "specifications": ["6.1-inch Super Retina XDR display", "A18 chip", "48MP Fusion camera", "USB-C charging"],
      "included_items": ["iPhone 16e", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-16",
      "name": "iPhone 16",
      "generation": "iPhone 16",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Black", "White", "Pink", "Teal", "Ultramarine"],
      "specifications": ["6.1-inch Super Retina XDR display", "A18 chip", "Dual camera system", "USB-C charging"],
      "included_items": ["iPhone 16", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-16-plus",
      "name": "iPhone 16 Plus",
      "generation": "iPhone 16",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Black", "White", "Pink", "Teal", "Ultramarine"],
      "specifications": ["6.7-inch Super Retina XDR display", "A18 chip", "Dual camera system", "USB-C charging"],
      "included_items": ["iPhone 16 Plus", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-17",
      "name": "iPhone 17",
      "generation": "iPhone 17",
      "storage": ["256GB", "512GB"],
      "colours": ["Black", "White", "Mist Blue", "Sage", "Lavender"],
      "specifications": ["6.3-inch Super Retina XDR display", "A19 chip", "Dual Fusion camera system", "USB-C charging"],
      "included_items": ["iPhone 17", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-air",
      "name": "iPhone Air",
      "generation": "iPhone 17",
      "storage": ["256GB", "512GB", "1TB"],
      "colours": ["Space Black", "Cloud White", "Light Gold", "Sky Blue"],
      "specifications": ["6.5-inch Super Retina XDR display", "A19 Pro chip", "48MP Fusion camera", "USB-C charging"],
      "included_items": ["iPhone Air", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-17-pro",
      "name": "iPhone 17 Pro",
      "generation": "iPhone 17",
      "storage": ["256GB", "512GB", "1TB"],
      "colours": ["Silver", "Cosmic Orange", "Deep Blue"],
      "specifications": ["6.3-inch Super Retina XDR display", "A19 Pro chip", "Triple 48MP Fusion camera system", "USB-C charging"],
      "included_items": ["iPhone 17 Pro", "USB-C cable", "Documentation"]
    },
    {
      "slug": "iphone-17-pro-max",
      "name": "iPhone 17 Pro Max",
      "generation": "iPhone 17",
      "storage": ["256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Cosmic Orange", "Deep Blue"],
      "specifications": ["6.9-inch Super Retina XDR display", "A19 Pro chip", "Triple 48MP Fusion camera system", "USB-C charging"],
      "included_items": ["iPhone 17 Pro Max", "USB-C cable", "Documentation"]
    }
  ]
  $catalogue$::jsonb) as model(
    slug text,
    name text,
    generation text,
    storage jsonb,
    colours jsonb,
    specifications jsonb,
    included_items jsonb
  )
)
insert into public.products (
  id, slug, name, brand, category, subcategory, model, generation, description,
  short_description, price, previous_price, price_on_request, condition,
  storage_options, colour_options, default_colour, battery_health, warranty,
  stock_quantity, stock_status, featured, new_arrival, popular, available,
  images, primary_image, specifications, included_items, delivery_information,
  tags, archived
)
select
  slug,
  slug,
  name,
  'Apple',
  'iPhones',
  null,
  name,
  generation,
  name || ' catalogue listing with verified Apple storage and colour options. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  name || ' catalogue listing. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  0,
  null,
  true,
  'To Confirm',
  storage,
  colours,
  colours ->> 0,
  null,
  'Warranty terms are confirmed when inventory is configured.',
  0,
  'Out of Stock',
  false,
  false,
  false,
  true,
  '[]'::jsonb,
  0,
  specifications,
  included_items,
  'Availability, price, condition, pickup and delivery details must be confirmed before payment.',
  jsonb_build_array('iphone', lower(name), lower(generation), 'contact for price'),
  false
from missing_models
on conflict (slug) do nothing;

commit;

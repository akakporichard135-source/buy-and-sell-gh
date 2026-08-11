-- Expand the public Apple Watch catalogue without inventing price, stock, or condition data.
-- Existing product business fields and images are preserved. New models remain
-- enquiry-only until the owner configures real inventory.

begin;

-- Classification-only normalization for the existing genuine Apple Watch listing.
update public.products
set
  category = 'Apple Watches',
  subcategory = coalesce(nullif(subcategory, ''), 'Apple Watch')
where slug = 'apple-watch';

with missing_models as (
  select *
  from jsonb_to_recordset($catalogue$
  [
    {
      "slug": "apple-watch-se-2",
      "name": "Apple Watch SE (2nd generation)",
      "subcategory": "Apple Watch SE",
      "generation": "Apple Watch SE 2",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Midnight", "Starlight", "Silver"],
      "specifications": ["40mm or 44mm aluminum case", "S8 chip with 32GB capacity", "Retina LTPO OLED display up to 1000 nits", "50m water resistance"],
      "included_items": ["Apple Watch SE (2nd generation)", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-se-3",
      "name": "Apple Watch SE 3",
      "subcategory": "Apple Watch SE",
      "generation": "Apple Watch SE 3",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Starlight", "Midnight"],
      "specifications": ["40mm or 44mm aluminum case", "S10 chip with 64GB capacity", "Always-On Retina OLED display", "50m water resistance"],
      "included_items": ["Apple Watch SE 3", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-series-7",
      "name": "Apple Watch Series 7",
      "subcategory": "Apple Watch Series",
      "generation": "Apple Watch Series 7",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Midnight", "Starlight", "Green", "Blue", "(PRODUCT)RED", "Graphite", "Silver", "Gold", "Titanium", "Space Black"],
      "specifications": ["41mm or 45mm case", "S7 chip with 32GB capacity", "Always-On Retina LTPO OLED display", "50m water resistance"],
      "included_items": ["Apple Watch Series 7", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-series-8",
      "name": "Apple Watch Series 8",
      "subcategory": "Apple Watch Series",
      "generation": "Apple Watch Series 8",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Midnight", "Starlight", "Silver", "(PRODUCT)RED", "Graphite", "Gold"],
      "specifications": ["41mm or 45mm case", "S8 chip with 32GB capacity", "Always-On Retina LTPO OLED display", "50m water resistance and IP6X dust resistance"],
      "included_items": ["Apple Watch Series 8", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-series-9",
      "name": "Apple Watch Series 9",
      "subcategory": "Apple Watch Series",
      "generation": "Apple Watch Series 9",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Pink", "Midnight", "Starlight", "Silver", "(PRODUCT)RED", "Gold", "Graphite"],
      "specifications": ["41mm or 45mm case", "S9 chip with 64GB capacity", "Always-On Retina LTPO OLED display up to 2000 nits", "50m water resistance"],
      "included_items": ["Apple Watch Series 9", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-series-10",
      "name": "Apple Watch Series 10",
      "subcategory": "Apple Watch Series",
      "generation": "Apple Watch Series 10",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Jet Black", "Rose Gold", "Silver", "Slate", "Gold", "Natural"],
      "specifications": ["42mm or 46mm case", "S10 chip with 64GB capacity", "Always-On wide-angle OLED LTPO3 display", "50m water resistance"],
      "included_items": ["Apple Watch Series 10", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-series-11",
      "name": "Apple Watch Series 11",
      "subcategory": "Apple Watch Series",
      "generation": "Apple Watch Series 11",
      "connectivity": ["GPS", "GPS + Cellular"],
      "colours": ["Rose Gold", "Silver", "Space Gray", "Jet Black", "Gold", "Natural", "Slate"],
      "specifications": ["42mm or 46mm case", "S10 chip with 64GB capacity", "Always-On wide-angle OLED LTPO3 display", "50m water resistance and IP6X dust resistance"],
      "included_items": ["Apple Watch Series 11", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-ultra",
      "name": "Apple Watch Ultra",
      "subcategory": "Apple Watch Ultra",
      "generation": "Apple Watch Ultra",
      "connectivity": ["GPS + Cellular"],
      "colours": ["Natural Titanium"],
      "specifications": ["49mm titanium case", "S8 chip with 32GB capacity", "Always-On Retina LTPO2 OLED display up to 2000 nits", "100m water resistance"],
      "included_items": ["Apple Watch Ultra", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-ultra-2",
      "name": "Apple Watch Ultra 2",
      "subcategory": "Apple Watch Ultra",
      "generation": "Apple Watch Ultra 2",
      "connectivity": ["GPS + Cellular"],
      "colours": ["Natural Titanium", "Black Titanium"],
      "specifications": ["49mm titanium case", "S9 chip with 64GB capacity", "Always-On Retina LTPO2 OLED display up to 3000 nits", "100m water resistance"],
      "included_items": ["Apple Watch Ultra 2", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    },
    {
      "slug": "apple-watch-ultra-3",
      "name": "Apple Watch Ultra 3",
      "subcategory": "Apple Watch Ultra",
      "generation": "Apple Watch Ultra 3",
      "connectivity": ["GPS + Cellular"],
      "colours": ["Natural Titanium", "Black Titanium"],
      "specifications": ["49mm titanium case", "S10 chip with 64GB capacity", "Always-On Retina LTPO3 OLED display", "100m water resistance"],
      "included_items": ["Apple Watch Ultra 3", "Band", "Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]
    }
  ]
  $catalogue$::jsonb) as model(
    slug text,
    name text,
    subcategory text,
    generation text,
    connectivity jsonb,
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
  'Apple Watches',
  subcategory,
  name,
  generation,
  name || ' catalogue listing with verified Apple case, connectivity, finish and hardware details. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  name || ' catalogue listing. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  0,
  null,
  true,
  'To Confirm',
  connectivity,
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
  jsonb_build_array('apple watch', lower(subcategory), lower(name), lower(generation), 'contact for price'),
  false
from missing_models
on conflict (slug) do nothing;

commit;

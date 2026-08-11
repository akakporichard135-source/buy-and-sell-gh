-- Expand the public iPad catalogue without inventing price, stock, or condition data.
-- Existing product business fields and images are preserved. New models remain
-- enquiry-only until the owner configures real inventory.

begin;

-- Classification-only normalization for the existing genuine iPad listing.
update public.products
set
  category = 'iPads',
  subcategory = coalesce(nullif(subcategory, ''), 'iPad Pro')
where slug = 'ipad-pro';

with missing_models as (
  select *
  from jsonb_to_recordset($catalogue$
  [
    {
      "slug": "ipad-10th-generation",
      "name": "iPad (10th generation)",
      "subcategory": "iPad",
      "generation": "iPad 10th generation",
      "storage": ["64GB", "256GB"],
      "colours": ["Silver", "Blue", "Pink", "Yellow"],
      "specifications": ["10.9-inch Liquid Retina display", "A14 Bionic chip", "Touch ID in the top button", "USB-C connector"],
      "included_items": ["iPad (10th generation)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-a16",
      "name": "iPad (A16)",
      "subcategory": "iPad",
      "generation": "iPad (A16)",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Silver", "Blue", "Pink", "Yellow"],
      "specifications": ["10.86-inch Liquid Retina display", "A16 chip", "Touch ID in the top button", "USB-C connector"],
      "included_items": ["iPad (A16)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-mini-6",
      "name": "iPad mini (6th generation)",
      "subcategory": "iPad mini",
      "generation": "iPad mini 6",
      "storage": ["64GB", "256GB"],
      "colours": ["Space Gray", "Pink", "Purple", "Starlight"],
      "specifications": ["8.3-inch Liquid Retina display", "A15 Bionic chip", "Touch ID in the top button", "USB-C connector"],
      "included_items": ["iPad mini (6th generation)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-mini-a17-pro",
      "name": "iPad mini (A17 Pro)",
      "subcategory": "iPad mini",
      "generation": "iPad mini 7",
      "storage": ["128GB", "256GB", "512GB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["8.3-inch Liquid Retina display", "A17 Pro chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad mini (A17 Pro)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-5",
      "name": "iPad Air (5th generation)",
      "subcategory": "iPad Air",
      "generation": "iPad Air 5",
      "storage": ["64GB", "256GB"],
      "colours": ["Space Gray", "Starlight", "Pink", "Purple", "Blue"],
      "specifications": ["10.9-inch Liquid Retina display", "Apple M1 chip", "Apple Pencil (2nd generation) support", "USB-C connector"],
      "included_items": ["iPad Air (5th generation)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-11-inch-m2",
      "name": "iPad Air 11-inch (M2)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M2",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["11-inch Liquid Retina display", "Apple M2 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 11-inch (M2)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-13-inch-m2",
      "name": "iPad Air 13-inch (M2)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M2",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["13-inch Liquid Retina display", "Apple M2 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 13-inch (M2)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-11-inch-m3",
      "name": "iPad Air 11-inch (M3)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M3",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["11-inch Liquid Retina display", "Apple M3 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 11-inch (M3)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-13-inch-m3",
      "name": "iPad Air 13-inch (M3)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M3",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["13-inch Liquid Retina display", "Apple M3 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 13-inch (M3)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-11-inch-m4",
      "name": "iPad Air 11-inch (M4)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M4",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["11-inch Liquid Retina display", "Apple M4 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 11-inch (M4)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-air-13-inch-m4",
      "name": "iPad Air 13-inch (M4)",
      "subcategory": "iPad Air",
      "generation": "iPad Air M4",
      "storage": ["128GB", "256GB", "512GB", "1TB"],
      "colours": ["Blue", "Purple", "Starlight", "Space Gray"],
      "specifications": ["13-inch Liquid Retina display", "Apple M4 chip", "Apple Pencil Pro support", "USB-C connector"],
      "included_items": ["iPad Air 13-inch (M4)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-11-inch-m2",
      "name": "iPad Pro 11-inch (M2)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M2",
      "storage": ["128GB", "256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Gray"],
      "specifications": ["11-inch Liquid Retina display with ProMotion", "Apple M2 chip", "Dual rear cameras with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 11-inch (M2)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-12-9-inch-m2",
      "name": "iPad Pro 12.9-inch (M2)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M2",
      "storage": ["128GB", "256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Gray"],
      "specifications": ["12.9-inch Liquid Retina XDR display with ProMotion", "Apple M2 chip", "Dual rear cameras with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 12.9-inch (M2)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-11-inch-m4",
      "name": "iPad Pro 11-inch (M4)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M4",
      "storage": ["256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Black"],
      "specifications": ["11.1-inch Ultra Retina XDR display with ProMotion", "Apple M4 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 11-inch (M4)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-13-inch-m4",
      "name": "iPad Pro 13-inch (M4)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M4",
      "storage": ["256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Black"],
      "specifications": ["13-inch Ultra Retina XDR display with ProMotion", "Apple M4 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 13-inch (M4)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-11-inch-m5",
      "name": "iPad Pro 11-inch (M5)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M5",
      "storage": ["256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Black"],
      "specifications": ["11.1-inch Ultra Retina XDR display with ProMotion", "Apple M5 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 11-inch (M5)", "USB-C Charge Cable"]
    },
    {
      "slug": "ipad-pro-13-inch-m5",
      "name": "iPad Pro 13-inch (M5)",
      "subcategory": "iPad Pro",
      "generation": "iPad Pro M5",
      "storage": ["256GB", "512GB", "1TB", "2TB"],
      "colours": ["Silver", "Space Black"],
      "specifications": ["13-inch Ultra Retina XDR display with ProMotion", "Apple M5 chip", "12MP Wide camera with LiDAR Scanner", "Thunderbolt / USB 4 connector"],
      "included_items": ["iPad Pro 13-inch (M5)", "USB-C Charge Cable"]
    }
  ]
  $catalogue$::jsonb) as model(
    slug text,
    name text,
    subcategory text,
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
  'iPads',
  subcategory,
  name,
  generation,
  name || ' catalogue listing with verified Apple storage, colour and hardware details. Contact Buy & Sell GH to confirm current inventory, condition and price.',
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
  jsonb_build_array('ipad', lower(subcategory), lower(name), lower(generation), 'contact for price'),
  false
from missing_models
on conflict (slug) do nothing;

commit;

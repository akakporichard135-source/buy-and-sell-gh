-- Expand the public MacBook catalogue without inventing price, stock, or condition data.
-- The live audit found no existing MacBook records. New models remain enquiry-only
-- until the owner configures genuine inventory and business information.

begin;

with missing_models (
  slug, name, subcategory, generation, storage_options, colour_options,
  specifications, included_items
) as (
  values
    (
      'macbook-air-13-m1', 'MacBook Air 13-inch (M1)', 'MacBook Air', 'M1',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Gold","Silver","Space Gray"]'::jsonb,
      '["Memory options: 8GB, 16GB","13.3-inch Retina display","Apple M1 chip","Two Thunderbolt / USB 4 ports and 3.5mm headphone jack","720p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.0"]'::jsonb,
      '["MacBook Air 13-inch (M1)","30W USB-C Power Adapter","USB-C Charge Cable"]'::jsonb
    ),
    (
      'macbook-air-13-m2', 'MacBook Air 13-inch (M2)', 'MacBook Air', 'M2',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Midnight","Starlight","Space Gray","Silver"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","13.6-inch Liquid Retina display","Apple M2 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt / USB 4 ports","1080p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 13-inch (M2)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-15-m2', 'MacBook Air 15-inch (M2)', 'MacBook Air', 'M2',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Midnight","Starlight","Space Gray","Silver"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","15.3-inch Liquid Retina display","Apple M2 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt / USB 4 ports","1080p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 15-inch (M2)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-13-m3', 'MacBook Air 13-inch (M3)', 'MacBook Air', 'M3',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Midnight","Starlight","Space Gray","Silver"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","13.6-inch Liquid Retina display","Apple M3 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt / USB 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 13-inch (M3)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-15-m3', 'MacBook Air 15-inch (M3)', 'MacBook Air', 'M3',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Midnight","Starlight","Space Gray","Silver"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","15.3-inch Liquid Retina display","Apple M3 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt / USB 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 15-inch (M3)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-13-m4', 'MacBook Air 13-inch (M4)', 'MacBook Air', 'M4',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Sky Blue","Silver","Starlight","Midnight"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","13.6-inch Liquid Retina display","Apple M4 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 13-inch (M4)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-15-m4', 'MacBook Air 15-inch (M4)', 'MacBook Air', 'M4',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Sky Blue","Silver","Starlight","Midnight"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","15.3-inch Liquid Retina display","Apple M4 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Air 15-inch (M4)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-13-m5', 'MacBook Air 13-inch (M5)', 'MacBook Air', 'M5',
      '["512GB","1TB","2TB","4TB"]'::jsonb, '["Sky Blue","Silver","Starlight","Midnight"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","13.6-inch Liquid Retina display","Apple M5 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 7 and Bluetooth 6"]'::jsonb,
      '["MacBook Air 13-inch (M5)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-air-15-m5', 'MacBook Air 15-inch (M5)', 'MacBook Air', 'M5',
      '["512GB","1TB","2TB","4TB"]'::jsonb, '["Sky Blue","Silver","Starlight","Midnight"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","15.3-inch Liquid Retina display","Apple M5 chip","MagSafe 3 charging port, 3.5mm headphone jack and two Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 7 and Bluetooth 6"]'::jsonb,
      '["MacBook Air 15-inch (M5)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-13-m1', 'MacBook Pro 13-inch (M1)', 'MacBook Pro', 'M1',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 8GB, 16GB","13.3-inch Retina display","Apple M1 chip","Touch Bar and Touch ID","Two Thunderbolt / USB 4 ports and 3.5mm headphone jack","720p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.0"]'::jsonb,
      '["MacBook Pro 13-inch (M1)","61W USB-C Power Adapter","USB-C Charge Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m1-pro-max', 'MacBook Pro 14-inch (M1 Pro / M1 Max)', 'MacBook Pro', 'M1',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 16GB, 32GB, 64GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M1 Pro or M1 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.0"]'::jsonb,
      '["MacBook Pro 14-inch (M1 Pro / M1 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-16-m1-pro-max', 'MacBook Pro 16-inch (M1 Pro / M1 Max)', 'MacBook Pro', 'M1',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 16GB, 32GB, 64GB","16.2-inch Liquid Retina XDR display with ProMotion","Apple M1 Pro or M1 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.0"]'::jsonb,
      '["MacBook Pro 16-inch (M1 Pro / M1 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-13-m2', 'MacBook Pro 13-inch (M2)', 'MacBook Pro', 'M2',
      '["256GB","512GB","1TB","2TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","13.3-inch Retina display","Apple M2 chip","Touch Bar and Touch ID","Two Thunderbolt / USB 4 ports and 3.5mm headphone jack","720p FaceTime HD camera","Wi-Fi 6 and Bluetooth 5.0"]'::jsonb,
      '["MacBook Pro 13-inch (M2)","67W USB-C Power Adapter","USB-C Charge Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m2-pro-max', 'MacBook Pro 14-inch (M2 Pro / M2 Max)', 'MacBook Pro', 'M2',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 16GB, 32GB, 64GB, 96GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M2 Pro or M2 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M2 Pro / M2 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-16-m2-pro-max', 'MacBook Pro 16-inch (M2 Pro / M2 Max)', 'MacBook Pro', 'M2',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 16GB, 32GB, 64GB, 96GB","16.2-inch Liquid Retina XDR display with ProMotion","Apple M2 Pro or M2 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 16-inch (M2 Pro / M2 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m3', 'MacBook Pro 14-inch (M3)', 'MacBook Pro', 'M3',
      '["512GB","1TB","2TB"]'::jsonb, '["Silver","Space Gray"]'::jsonb,
      '["Memory options: 8GB, 16GB, 24GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M3 chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and two Thunderbolt / USB 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M3)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m3-pro-max', 'MacBook Pro 14-inch (M3 Pro / M3 Max)', 'MacBook Pro', 'M3',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 18GB, 36GB, 48GB, 64GB, 96GB, 128GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M3 Pro or M3 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M3 Pro / M3 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-16-m3-pro-max', 'MacBook Pro 16-inch (M3 Pro / M3 Max)', 'MacBook Pro', 'M3',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 18GB, 36GB, 48GB, 64GB, 96GB, 128GB","16.2-inch Liquid Retina XDR display with ProMotion","Apple M3 Pro or M3 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","1080p FaceTime HD camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 16-inch (M3 Pro / M3 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m4', 'MacBook Pro 14-inch (M4)', 'MacBook Pro', 'M4',
      '["512GB","1TB","2TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M4 chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M4)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m4-pro-max', 'MacBook Pro 14-inch (M4 Pro / M4 Max)', 'MacBook Pro', 'M4',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 24GB, 36GB, 48GB, 64GB, 128GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M4 Pro or M4 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 5 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M4 Pro / M4 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-16-m4-pro-max', 'MacBook Pro 16-inch (M4 Pro / M4 Max)', 'MacBook Pro', 'M4',
      '["512GB","1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 24GB, 36GB, 48GB, 64GB, 128GB","16.2-inch Liquid Retina XDR display with ProMotion","Apple M4 Pro or M4 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 5 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 16-inch (M4 Pro / M4 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m5', 'MacBook Pro 14-inch (M5)', 'MacBook Pro', 'M5',
      '["512GB","1TB","2TB","4TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 16GB, 24GB, 32GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M5 chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 4 ports","12MP Center Stage camera","Wi-Fi 6E and Bluetooth 5.3"]'::jsonb,
      '["MacBook Pro 14-inch (M5)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-14-m5-pro-max', 'MacBook Pro 14-inch (M5 Pro / M5 Max)', 'MacBook Pro', 'M5',
      '["1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 24GB, 36GB, 48GB, 64GB, 128GB","14.2-inch Liquid Retina XDR display with ProMotion","Apple M5 Pro or M5 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 5 ports","12MP Center Stage camera","Wi-Fi 7 and Bluetooth 6"]'::jsonb,
      '["MacBook Pro 14-inch (M5 Pro / M5 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
    ),
    (
      'macbook-pro-16-m5-pro-max', 'MacBook Pro 16-inch (M5 Pro / M5 Max)', 'MacBook Pro', 'M5',
      '["1TB","2TB","4TB","8TB"]'::jsonb, '["Space Black","Silver"]'::jsonb,
      '["Memory options: 24GB, 36GB, 48GB, 64GB, 128GB","16.2-inch Liquid Retina XDR display with ProMotion","Apple M5 Pro or M5 Max chip","MagSafe 3, HDMI, SDXC, 3.5mm headphone jack and three Thunderbolt 5 ports","12MP Center Stage camera","Wi-Fi 7 and Bluetooth 6"]'::jsonb,
      '["MacBook Pro 16-inch (M5 Pro / M5 Max)","USB-C Power Adapter","USB-C to MagSafe 3 Cable"]'::jsonb
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
  'MacBooks',
  subcategory,
  name,
  generation,
  name || ' catalogue listing with verified Apple memory, storage, finish and hardware options. Contact Buy & Sell GH to confirm current inventory, condition, configuration and price.',
  name || ' catalogue listing. Contact Buy & Sell GH to confirm current inventory, condition, configuration and price.',
  0,
  null,
  true,
  'To Confirm',
  storage_options,
  colour_options,
  colour_options ->> 0,
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
  'Availability, price, condition, configuration, pickup and delivery details must be confirmed before payment.',
  jsonb_build_array('macbook', lower(subcategory), lower(name), lower(generation), 'contact for price'),
  false
from missing_models
on conflict (slug) do nothing;

commit;

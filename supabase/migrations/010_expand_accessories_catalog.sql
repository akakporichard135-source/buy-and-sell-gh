-- Add a focused Apple accessories catalogue without inventing price, stock, or condition data.
-- This migration is insert-only and does not modify any existing product record.

begin;

with missing_accessories (
  slug, name, subcategory, option_values, colour_options,
  specifications, included_items
) as (
  values
    (
      'apple-20w-usb-c-power-adapter', 'Apple 20W USB-C Power Adapter', 'Charging & Power',
      '["20W USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 20W","Connector: USB-C","Compatibility: USB-C enabled iPhone and iPad models; other USB-C devices","Charging: Fast charging supported with a compatible cable and device"]'::jsonb,
      '["Apple 20W USB-C Power Adapter"]'::jsonb
    ),
    (
      'apple-30w-usb-c-power-adapter', 'Apple 30W USB-C Power Adapter', 'Charging & Power',
      '["30W USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 30W","Connector: USB-C","Compatibility: MacBook Air and compatible USB-C Apple devices","Charging: USB-C Power Delivery"]'::jsonb,
      '["Apple 30W USB-C Power Adapter"]'::jsonb
    ),
    (
      'apple-35w-dual-usb-c-power-adapter', 'Apple 35W Dual USB-C Port Power Adapter', 'Charging & Power',
      '["35W Dual USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 35W total","Connector: Two USB-C ports","Compatibility: Compatible USB-C Apple devices","Charging: Charge two devices at the same time"]'::jsonb,
      '["Apple 35W Dual USB-C Port Power Adapter"]'::jsonb
    ),
    (
      'apple-70w-usb-c-power-adapter', 'Apple 70W USB-C Power Adapter', 'Charging & Power',
      '["70W USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 70W","Connector: USB-C","Compatibility: Compatible MacBook and USB-C Apple devices","Charging: Fast charging supported on compatible MacBook models"]'::jsonb,
      '["Apple 70W USB-C Power Adapter"]'::jsonb
    ),
    (
      'apple-96w-usb-c-power-adapter', 'Apple 96W USB-C Power Adapter', 'Charging & Power',
      '["96W USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 96W","Connector: USB-C","Compatibility: Compatible MacBook Pro and USB-C devices","Charging: USB-C Power Delivery"]'::jsonb,
      '["Apple 96W USB-C Power Adapter"]'::jsonb
    ),
    (
      'apple-140w-usb-c-power-adapter', 'Apple 140W USB-C Power Adapter', 'Charging & Power',
      '["140W USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: 140W","Connector: USB-C","Compatibility: Compatible MacBook Pro and USB-C devices","Charging: USB-C Power Delivery 3.1"]'::jsonb,
      '["Apple 140W USB-C Power Adapter"]'::jsonb
    ),
    (
      'apple-magsafe-charger', 'Apple MagSafe Charger', 'Charging & Power',
      '["USB-C / 1m"]'::jsonb, '["White"]'::jsonb,
      '["Connector: USB-C","Cable length: 1 metre","MagSafe support: Magnetic alignment for compatible iPhone models","Compatibility: MagSafe iPhone models, Qi-compatible iPhone and AirPods charging cases"]'::jsonb,
      '["MagSafe Charger with integrated 1m USB-C cable"]'::jsonb
    ),
    (
      'apple-usb-c-charge-cable', 'Apple USB-C Charge Cable', 'Cables',
      '["USB-C to USB-C / 1m"]'::jsonb, '["White"]'::jsonb,
      '["Connector: USB-C to USB-C","Cable length: 1 metre","Charging: Charging and USB 2 data transfer","Compatibility: USB-C Apple devices and power adapters"]'::jsonb,
      '["Apple USB-C Charge Cable"]'::jsonb
    ),
    (
      'apple-usb-c-to-lightning-cable', 'Apple USB-C to Lightning Cable', 'Cables',
      '["USB-C to Lightning / 1m"]'::jsonb, '["White"]'::jsonb,
      '["Connector: USB-C to Lightning","Cable length: 1 metre","Charging: Charging and syncing","Compatibility: Lightning-equipped iPhone, iPad, AirPods and Apple accessories"]'::jsonb,
      '["Apple USB-C to Lightning Cable"]'::jsonb
    ),
    (
      'apple-60w-usb-c-charge-cable', 'Apple 60W USB-C Charge Cable', 'Cables',
      '["USB-C to USB-C / 1m"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: Up to 60W charging","Connector: USB-C to USB-C","Cable length: 1 metre","Compatibility: USB-C Apple devices and displays; USB 2 data transfer"]'::jsonb,
      '["Apple 60W USB-C Charge Cable (1m)"]'::jsonb
    ),
    (
      'apple-240w-usb-c-charge-cable', 'Apple 240W USB-C Charge Cable', 'Cables',
      '["USB-C to USB-C / 2m"]'::jsonb, '["White"]'::jsonb,
      '["Wattage: Up to 240W charging","Connector: USB-C to USB-C","Cable length: 2 metres","Compatibility: USB-C Apple devices; USB 2 data transfer"]'::jsonb,
      '["Apple 240W USB-C Charge Cable (2m)"]'::jsonb
    ),
    (
      'apple-usb-c-to-magsafe-3-cable', 'Apple USB-C to MagSafe 3 Cable', 'Cables',
      '["USB-C to MagSafe 3 / 2m"]'::jsonb, '["Silver","Space Gray","Midnight","Starlight","Space Black","Sky Blue"]'::jsonb,
      '["Connector: USB-C to MagSafe 3","Cable length: 2 metres","Charging: Magnetic Mac notebook charging connection","Compatibility: MacBook Air and MacBook Pro models with MagSafe 3"]'::jsonb,
      '["Apple USB-C to MagSafe 3 Cable (2m)"]'::jsonb
    ),
    (
      'apple-magsafe-iphone-case', 'Apple MagSafe iPhone Case', 'iPhone Accessories',
      '["Confirm iPhone model"]'::jsonb, '["Colour to Confirm"]'::jsonb,
      '["MagSafe support: Built-in magnets for MagSafe alignment","Compatibility: Exact iPhone model must be confirmed","Material: Official Apple case material varies by selected model","Charging: Works with compatible MagSafe chargers"]'::jsonb,
      '["Apple MagSafe iPhone Case"]'::jsonb
    ),
    (
      'apple-clear-iphone-case-magsafe', 'Apple iPhone Clear Case with MagSafe', 'iPhone Accessories',
      '["Confirm iPhone model"]'::jsonb, '["Clear"]'::jsonb,
      '["MagSafe support: Built-in magnets for MagSafe alignment","Compatibility: Exact iPhone model must be confirmed","Material: Clear polycarbonate and flexible materials","Charging: Works with compatible MagSafe chargers"]'::jsonb,
      '["Apple iPhone Clear Case with MagSafe"]'::jsonb
    ),
    (
      'apple-pencil-usb-c', 'Apple Pencil (USB-C)', 'iPad Accessories',
      '["USB-C"]'::jsonb, '["White"]'::jsonb,
      '["Connector: USB-C under sliding cap","Charging: USB-C cable pairing and charging","Compatibility: Compatible USB-C iPad models; confirm exact iPad before payment","Features: Pixel-perfect precision, low latency and tilt sensitivity"]'::jsonb,
      '["Apple Pencil (USB-C)"]'::jsonb
    ),
    (
      'apple-pencil-pro', 'Apple Pencil Pro', 'iPad Accessories',
      '["Magnetic charging"]'::jsonb, '["White"]'::jsonb,
      '["Charging: Magnetic pairing and charging","Compatibility: Compatible iPad Pro and iPad Air models; confirm exact model","Features: Squeeze, barrel roll, haptic feedback and Find My support","Connector: Magnetic iPad attachment"]'::jsonb,
      '["Apple Pencil Pro"]'::jsonb
    ),
    (
      'apple-magic-keyboard-ipad', 'Magic Keyboard for iPad', 'iPad Accessories',
      '["Confirm iPad size/model"]'::jsonb, '["Black","White"]'::jsonb,
      '["Connector: Smart Connector and USB-C pass-through charging","Compatibility: Model-specific iPad Pro or iPad Air versions","Features: Trackpad, function row and adjustable floating design","Charging: Pass-through USB-C charging"]'::jsonb,
      '["Magic Keyboard for iPad"]'::jsonb
    ),
    (
      'apple-magic-keyboard-folio', 'Magic Keyboard Folio', 'iPad Accessories',
      '["iPad (A16) / iPad 10th generation"]'::jsonb, '["White"]'::jsonb,
      '["Connector: Smart Connector","Compatibility: iPad (A16) and iPad (10th generation)","Features: Detachable keyboard, trackpad, 14-key function row and adjustable back panel","Charging: Powered by iPad; no separate charging required"]'::jsonb,
      '["Magic Keyboard Folio keyboard","Adjustable back panel"]'::jsonb
    ),
    (
      'apple-magic-mouse', 'Magic Mouse', 'Mac Accessories',
      '["USB-C"]'::jsonb, '["White Multi-Touch Surface","Black Multi-Touch Surface"]'::jsonb,
      '["Connector: USB-C charging cable","Compatibility: Bluetooth-enabled Mac and iPad models","Features: Wireless Multi-Touch surface","Charging: Rechargeable internal battery"]'::jsonb,
      '["Magic Mouse","USB-C Charge Cable"]'::jsonb
    ),
    (
      'apple-magic-trackpad', 'Magic Trackpad', 'Mac Accessories',
      '["USB-C"]'::jsonb, '["White Multi-Touch Surface","Black Multi-Touch Surface"]'::jsonb,
      '["Connector: USB-C charging cable","Compatibility: Bluetooth-enabled Mac and iPad models","Features: Force Touch, Multi-Touch gestures and edge-to-edge glass surface","Charging: Rechargeable internal battery"]'::jsonb,
      '["Magic Trackpad","USB-C Charge Cable"]'::jsonb
    ),
    (
      'apple-magic-keyboard', 'Magic Keyboard', 'Mac Accessories',
      '["USB-C"]'::jsonb, '["White Keys"]'::jsonb,
      '["Connector: USB-C charging cable","Compatibility: Bluetooth-enabled Mac, iPad and iPhone models","Features: Compact wireless keyboard with scissor mechanism","Charging: Rechargeable internal battery"]'::jsonb,
      '["Magic Keyboard","USB-C Charge Cable"]'::jsonb
    ),
    (
      'apple-magic-keyboard-touch-id', 'Magic Keyboard with Touch ID', 'Mac Accessories',
      '["USB-C / Touch ID"]'::jsonb, '["White Keys","Black Keys"]'::jsonb,
      '["Connector: USB-C charging cable","Compatibility: Mac models with Apple silicon","Features: Touch ID, compact wireless keyboard and scissor mechanism","Charging: Rechargeable internal battery"]'::jsonb,
      '["Magic Keyboard with Touch ID","USB-C Charge Cable"]'::jsonb
    ),
    (
      'apple-watch-magnetic-fast-charger-usb-c', 'Apple Watch Magnetic Fast Charger to USB-C Cable', 'Watch Accessories',
      '["USB-C / 1m"]'::jsonb, '["White"]'::jsonb,
      '["Connector: USB-C","Cable length: 1 metre","Charging: Magnetic fast charging on supported Apple Watch models","Compatibility: Apple Watch models; fast-charge support varies by model"]'::jsonb,
      '["Apple Watch Magnetic Fast Charger to USB-C Cable (1m)"]'::jsonb
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
  'Accessories',
  subcategory,
  name,
  null,
  name || ' catalogue listing with verified connector, charging and compatibility information. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  name || ' catalogue listing. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  0,
  null,
  true,
  'To Confirm',
  option_values,
  colour_options,
  colour_options ->> 0,
  null,
  'Warranty and packaging are confirmed when inventory is configured.',
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
  'Availability, compatibility, price, condition, pickup and delivery details must be confirmed before payment.',
  jsonb_build_array('apple accessory', lower(subcategory), lower(name), 'contact for price'),
  false
from missing_accessories
on conflict (slug) do nothing;

commit;

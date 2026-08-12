-- Expand the public AirPods catalogue without inventing price, stock, or condition data.
-- The existing generic airpods-pro record is intentionally not updated because its
-- genuine generation is not identifiable from the current production data.

begin;

with missing_models (
  slug, name, subcategory, generation, case_options, colour_options,
  specifications, included_items
) as (
  values
    (
      'airpods-2nd-generation', 'AirPods (2nd generation)', 'AirPods', '2nd generation',
      '["Lightning Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H1 headphone chip","Up to 5 hours of listening time on one charge","Lightning Charging Case","Bluetooth 5.0"]'::jsonb,
      '["AirPods (2nd generation)","Lightning Charging Case","Lightning to USB-A Cable"]'::jsonb
    ),
    (
      'airpods-3rd-generation', 'AirPods (3rd generation)', 'AirPods', '3rd generation',
      '["Lightning Charging Case","MagSafe Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H1 headphone chip","Personalized Spatial Audio with dynamic head tracking","Adaptive EQ","Up to 6 hours of listening time on one charge","Sweat and water resistant (IPX4)"]'::jsonb,
      '["AirPods (3rd generation)","Selected Charging Case","Lightning to USB-C Cable"]'::jsonb
    ),
    (
      'airpods-4', 'AirPods 4', 'AirPods', '4th generation',
      '["USB-C Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H2 headphone chip","Personalized Spatial Audio with dynamic head tracking","Voice Isolation","Up to 5 hours of listening time on one charge","Dust, sweat and water resistant (IP54)"]'::jsonb,
      '["AirPods 4","USB-C Charging Case","Documentation"]'::jsonb
    ),
    (
      'airpods-4-anc', 'AirPods 4 with Active Noise Cancellation', 'AirPods', '4th generation',
      '["USB-C Wireless Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H2 headphone chip","Active Noise Cancellation","Adaptive Audio and Transparency mode","Up to 4 hours of listening time with Active Noise Cancellation","Dust, sweat and water resistant (IP54)"]'::jsonb,
      '["AirPods 4 with Active Noise Cancellation","USB-C Charging Case with speaker","Documentation"]'::jsonb
    ),
    (
      'airpods-pro-1', 'AirPods Pro (1st generation)', 'AirPods Pro', '1st generation',
      '["Lightning Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H1 headphone chip","Active Noise Cancellation","Transparency mode","Spatial Audio with dynamic head tracking","Sweat and water resistant (IPX4)"]'::jsonb,
      '["AirPods Pro (1st generation)","Lightning Charging Case","Silicone ear tips","Lightning to USB-C Cable"]'::jsonb
    ),
    (
      'airpods-pro-2', 'AirPods Pro 2', 'AirPods Pro', '2nd generation',
      '["USB-C MagSafe Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H2 headphone chip","Active Noise Cancellation","Adaptive Audio and Transparency mode","Up to 6 hours of listening time with Active Noise Cancellation","Dust, sweat and water resistant (IP54)"]'::jsonb,
      '["AirPods Pro 2","MagSafe Charging Case (USB-C)","Silicone ear tips","USB-C Charge Cable"]'::jsonb
    ),
    (
      'airpods-pro-3', 'AirPods Pro 3', 'AirPods Pro', '3rd generation',
      '["USB-C MagSafe Charging Case"]'::jsonb, '["White"]'::jsonb,
      '["Apple H2 headphone chip","Active Noise Cancellation and Adaptive Audio","Heart rate sensing during workouts","Up to 8 hours of listening time with Active Noise Cancellation","Dust, sweat and water resistant (IP57)"]'::jsonb,
      '["AirPods Pro 3","MagSafe Charging Case (USB-C) with speaker and lanyard loop","Silicone ear tips","Documentation"]'::jsonb
    ),
    (
      'airpods-max-lightning', 'AirPods Max (Lightning)', 'AirPods Max', '1st generation',
      '["Lightning"]'::jsonb, '["Silver","Space Gray","Sky Blue","Pink","Green"]'::jsonb,
      '["Apple H1 headphone chip in each ear cup","Active Noise Cancellation and Transparency mode","Personalized Spatial Audio with dynamic head tracking","Up to 20 hours of listening time","Lightning connector"]'::jsonb,
      '["AirPods Max (Lightning)","Smart Case","Lightning to USB-C Cable"]'::jsonb
    ),
    (
      'airpods-max-usb-c', 'AirPods Max (USB-C)', 'AirPods Max', '1st generation',
      '["USB-C"]'::jsonb, '["Midnight","Starlight","Blue","Purple","Orange"]'::jsonb,
      '["Apple H1 headphone chip in each ear cup","Active Noise Cancellation and Transparency mode","Personalized Spatial Audio with dynamic head tracking","Up to 20 hours of listening time","USB-C connector"]'::jsonb,
      '["AirPods Max (USB-C)","Smart Case","USB-C Charge Cable"]'::jsonb
    ),
    (
      'airpods-max-2', 'AirPods Max 2', 'AirPods Max', '2nd generation',
      '["USB-C"]'::jsonb, '["Midnight","Starlight","Blue","Purple","Orange"]'::jsonb,
      '["Apple H2 headphone chip in each ear cup","Active Noise Cancellation","Adaptive Audio and Transparency mode","Lossless Audio and ultra-low latency audio via USB-C","USB-C connector"]'::jsonb,
      '["AirPods Max 2","Smart Case","USB-C Charge Cable"]'::jsonb
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
  slug, slug, name, 'Apple', 'AirPods', subcategory, name, generation,
  name || ' catalogue listing with verified Apple generation, charging and audio feature information. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  name || ' catalogue listing. Contact Buy & Sell GH to confirm current inventory, condition and price.',
  0, null, true, 'To Confirm', case_options, colour_options, colour_options ->> 0,
  null, 'Warranty terms are confirmed when inventory is configured.',
  0, 'Out of Stock', false, false, false, true, '[]'::jsonb, 0,
  specifications, included_items,
  'Availability, price, condition, case configuration, pickup and delivery details must be confirmed before payment.',
  jsonb_build_array('airpods', lower(subcategory), lower(name), lower(generation), 'contact for price'),
  false
from missing_models
on conflict (slug) do nothing;

commit;

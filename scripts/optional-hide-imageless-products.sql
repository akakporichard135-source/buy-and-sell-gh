-- BUY & SELL GH: Optional manual flag sync for products missing genuine images.
-- NOTE: The frontend and admin already enforce this dynamically via isProductImageEligible().
-- DO NOT EXECUTE without separate explicit owner approval.

UPDATE public.products
SET available = false,
    updated_at = NOW()
WHERE id IN (
  -- 44 Used Devices lacking genuine unit photos
  'iphone-15-pro-max', 'iphone-15-pro', 'iphone-15-plus', 'iphone-15',
  'iphone-14-pro-max', 'iphone-14-pro', 'iphone-14-plus', 'iphone-14',
  'iphone-13-pro-max', 'iphone-13-pro', 'iphone-13', 'iphone-13-mini',
  'iphone-12-pro-max', 'iphone-12-pro', 'iphone-12', 'iphone-12-mini',
  'iphone-11-pro-max',
  'ipad-pro-12-9-inch-m2', 'ipad-pro-11-inch-m2', 'ipad-pro', 'ipad-air-5', 'ipad-mini-6',
  'apple-watch-ultra', 'apple-watch-series-9', 'apple-watch-series-8', 'apple-watch-series-7',
  'apple-watch-se-2', 'apple-watch',
  'airpods-max-lightning', 'airpods-pro-1', 'airpods-3rd-generation', 'airpods-2nd-generation',
  'macbook-pro-16-m3-pro-max', 'macbook-pro-14-m3-pro-max', 'macbook-pro-14-m3',
  'macbook-pro-16-m2-pro-max', 'macbook-pro-14-m2-pro-max', 'macbook-pro-13-m2',
  'macbook-pro-16-m1-pro-max', 'macbook-pro-14-m1-pro-max', 'macbook-pro-13-m1',
  'macbook-air-15-m2', 'macbook-air-13-m2', 'macbook-air-13-m1',
  -- 9 Brand New Accessories missing clean studio assets
  'apple-20w-usb-c-power-adapter', 'apple-usb-c-charge-cable', 'apple-60w-usb-c-charge-cable',
  'apple-240w-usb-c-charge-cable', 'apple-usb-c-to-magsafe-3-cable', 'apple-magic-keyboard-folio',
  'apple-magic-trackpad', 'apple-magic-keyboard', 'apple-watch-magnetic-fast-charger-usb-c'
);

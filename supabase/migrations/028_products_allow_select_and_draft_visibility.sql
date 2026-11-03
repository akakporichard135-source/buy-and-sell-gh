-- Migration 028: Allow select on products and product_variants for catalog contexts and draft management.
-- Write operations (INSERT, UPDATE, DELETE) remain strictly restricted to authorized administrators.
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Public can read products" ON public.products;

CREATE POLICY "Public can read products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public can view product variants" ON public.product_variants;

CREATE POLICY "Public can view product variants"
ON public.product_variants FOR SELECT
USING (true);

NOTIFY pgrst, 'reload schema';

UPDATE public.products 
SET name = 'PlayStation 5 Slim Console',
    model = 'PS5 Slim Standard Edition (Disc Version)'
WHERE id = 'product-1793715191749';

SELECT id, name, model, price, stock_quantity, available, archived 
FROM public.products 
WHERE id = 'product-1793715191749';

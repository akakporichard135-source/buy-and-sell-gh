-- Correct enum-like product checks after 001_product_catalog.sql has already run.
-- This keeps existing data, maps legacy values, and re-adds strict validation.

alter table public.products
  drop constraint if exists products_condition_check;

alter table public.products
  drop constraint if exists products_stock_status_check;

update public.products
set condition = case condition
  when 'New' then 'Brand New'
  when 'Refurbished' then 'Excellent'
  when 'Used' then 'Very Good'
  else condition
end
where condition in ('New', 'Refurbished', 'Used');

update public.products
set stock_status = case stock_status
  when 'In stock' then 'In Stock'
  when 'Limited stock' then 'Low Stock'
  when 'Low stock' then 'Low Stock'
  when 'On request' then 'Low Stock'
  when 'Sold Out' then 'Sold'
  else stock_status
end
where stock_status in ('In stock', 'Limited stock', 'Low stock', 'On request', 'Sold Out');

alter table public.products
  add constraint products_condition_check
  check (condition in ('Brand New', 'UK Used', 'Excellent', 'Very Good'));

alter table public.products
  add constraint products_stock_status_check
  check (stock_status in ('In Stock', 'Low Stock', 'Out of Stock', 'Sold'));

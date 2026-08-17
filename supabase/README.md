# Buy & Sell GH Supabase Setup

This project is wired for Supabase, but the backend is not live until real project credentials and database setup are completed.

## Environment Variables

Set these in local `.env.local` and in Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PRODUCT_IMAGES_BUCKET`

The default bucket name is `product-images`.

## Setup Steps

1. Create a Supabase project.
2. Enable Email/Password Auth and TOTP MFA in Supabase Auth.
3. Run `supabase/migrations/001_product_catalog.sql`.
4. Create the owner admin user in Supabase Auth.
5. Add that user's UUID to `public.admin_profiles`:

```sql
insert into public.admin_profiles (user_id, email, role)
values ('AUTH_USER_UUID_HERE', 'owner@example.com', 'owner');
```

6. Upload existing product images to the `product-images` bucket.
7. Add the production URL ending in `/admin/reset-password` to the Supabase Auth redirect allow list.
8. Run `supabase/seed-products.sql` once, then update product image URLs through `/admin/products`.
9. Apply later migrations in numeric order. Review `012_admin_mfa_hardening.sql` manually before running it.

## Security Notes

- RLS must remain enabled.
- Never put service-role keys in frontend code.
- Users cannot promote themselves; only owners can manage `admin_profiles`.
- Product writes and storage uploads are restricted to `owner` or `admin` roles.
- Public visitors can only read active, available, non-archived products and public product images.
- Migration 012 requires an AAL2 Supabase JWT for privileged database and storage actions.
- Deploy the MFA-capable frontend and enroll the owner before enabling AAL2-only database authorization.

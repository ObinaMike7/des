-- Supabase RLS policies for this project.
-- Run these in Supabase SQL Editor after the tables exist (run `node setup-db.js` first).

-- Enable RLS (recommended)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Read access: any authenticated user can read
DO $$
BEGIN
  CREATE POLICY "products_read_authenticated"
    ON public.products
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "categories_read_authenticated"
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "inventory_logs_read_authenticated"
    ON public.inventory_logs
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Write access: only authenticated users with user_metadata.role = 'admin'
-- (Supabase puts user metadata into the JWT under `user_metadata`.)
DO $$
BEGIN
  CREATE POLICY "products_write_admin_only"
    ON public.products
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "categories_write_admin_only"
    ON public.categories
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "inventory_logs_write_admin_only"
    ON public.inventory_logs
    FOR ALL
    TO authenticated
    USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


# Inventory System - Setup Guide

## Backend setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
The project is currently configured to use your existing PostgreSQL database:

- `ACCOUNTS_DB_NAME=inventory`
- `PRODUCTS_DB_NAME=inventory`

If you want to use Supabase PostgreSQL instead, set these in `.env`:

- `DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres`
- `DB_SSL=true`
- `DB_SSL_REJECT_UNAUTHORIZED=false`
- `ACCOUNTS_DB_NAME=postgres`
- `PRODUCTS_DB_NAME=postgres`
- `DB_NAME=postgres`

Notes:

- Keep `JWT_SECRET` and `PORT` as-is.
- The backend now supports both local PostgreSQL (`DB_HOST`, `DB_USER`, etc.) and connection-string mode (`DATABASE_URL`).
- When `DATABASE_URL` is present, `setup-db.js` skips `CREATE DATABASE` and only applies schema + seed data.
- If you see `getaddrinfo ENOTFOUND ...supabase.co`, it means your machine can’t resolve the database hostname (DNS/network/VPN) or the connection string host is incorrect. Re-copy the connection string from Supabase Dashboard → Project Settings → Database (pooler recommended), or switch to local Postgres settings.
- If you use `supabase-js` from the frontend, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your Vercel project env vars.
- (Recommended) If you enable RLS on Supabase, apply `database/supabase_policies.sql` in the Supabase SQL Editor so authenticated users can read products and admins can write.

### 3. Create and seed both databases
Run:
```bash
node setup-db.js
```

This command will:

- create the configured database if it does not exist
- apply the account and product schema to `inventory`
- seed sample products
- migrate legacy product rows from `inventory_products` into `inventory` when needed
- create these test accounts:
  - `admin@inventory.com` / `admin123`
  - `user@inventory.com` / `user123`

### 4. Start the backend server
```bash
npm run server
```

The API will run at `http://localhost:5000`.

### 5. Start the frontend
In another terminal:
```bash
npm run dev
```

## What changed

- Admin homepage:
  - Add product now inserts into the `inventory` database
  - Edit and delete continue to use the same `inventory` database
- User homepage:
  - now loads real products from the API
  - now has a working `Add New Product` button that inserts into `inventory`
- Authentication:
  - sign-in and sign-up now use the same `inventory` database

## Database files

- Accounts schema: `database/accounts_schema.sql`
- Products schema: `database/products_schema.sql`
- Combined note: `database_schema.sql`

## API endpoints

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/signin`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

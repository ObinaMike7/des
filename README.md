# Inventory System

React + Vite frontend with an Express + PostgreSQL backend for account management and product inventory.

## Quick start

```bash
npm install
node setup-db.js
npm run server
npm run dev
```

## Deploy (Supabase + Vercel)

### 1) Provision the database on Supabase
- Create a Supabase project and grab the PostgreSQL connection string.
- Locally, set `DATABASE_URL` (and optional SSL vars) in `.env`, then run `node setup-db.js` once to create tables + seed data.

### 2) Deploy to Vercel
This repo includes a Vercel Function entrypoint in `api/[...path].js`, so `/api/*` routes can be hosted on Vercel alongside the Vite frontend.

Set these environment variables in Vercel:
- `DATABASE_URL` (your Supabase Postgres connection string; using the pooler is recommended)
- `JWT_SECRET` (a strong secret)
- `VITE_API_BASE_URL` (set to an empty string to use same-origin `/api/*` on Vercel)
- `VITE_SUPABASE_URL` (your Supabase project URL)
- `VITE_SUPABASE_ANON_KEY` (your Supabase anon key)

Then deploy normally (Vercel will run `npm run build` and serve `dist/`).

## Supabase setup (optional)

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your Supabase PostgreSQL connection string.
3. Set:
   - `DB_SSL=true`
   - `DB_SSL_REJECT_UNAUTHORIZED=false`
   - `DB_NAME=postgres`
   - `ACCOUNTS_DB_NAME=postgres`
   - `PRODUCTS_DB_NAME=postgres`
4. Run `node setup-db.js` to apply schema and seed data.
5. (Recommended) If you enable RLS, apply policies from `database/supabase_policies.sql` in the Supabase SQL Editor.

## Database layout

The app is currently configured to use the same PostgreSQL database, `inventory`, for:

- user/admin accounts
- categories, products, and inventory logs

Schemas live in:

- `database/accounts_schema.sql`
- `database/products_schema.sql`

## Features

- admin and user sign-in/sign-up
- auth and product data stored in the same `inventory` database
- live product listing on both dashboards
- add product from admin homepage
- add product from user homepage
- edit and delete product from admin homepage

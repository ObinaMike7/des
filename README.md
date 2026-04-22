# Inventory System

React + Vite frontend with an Express + PostgreSQL backend for account management and product inventory.

## Quick start

```bash
npm install
node setup-db.js
npm run server
npm run dev
```

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

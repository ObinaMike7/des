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

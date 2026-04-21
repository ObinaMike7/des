import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

export const baseDbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
}

const sharedDatabaseName = process.env.DB_NAME

export const databaseNames = {
  accounts: process.env.ACCOUNTS_DB_NAME || sharedDatabaseName || 'inventory_accounts',
  products: process.env.PRODUCTS_DB_NAME || sharedDatabaseName || 'inventory_products',
}

export const createPool = (database, label) => {
  const pool = new Pool({
    ...baseDbConfig,
    database,
  })

  pool.on('error', (err) => {
    console.error(`Unexpected error on idle ${label} database client`, err)
  })

  return pool
}

export const accountsPool = createPool(databaseNames.accounts, 'accounts')
export const productsPool = createPool(databaseNames.products, 'products')

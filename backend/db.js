import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const parseBooleanEnv = (value) => {
  if (value === undefined) {
    return undefined
  }

  return value === 'true'
}

const parsePortEnv = (value) => {
  if (!value) {
    return undefined
  }

  const parsedPort = Number.parseInt(value, 10)
  return Number.isNaN(parsedPort) ? undefined : parsedPort
}

const parseDatabaseFromConnectionString = (connectionString) => {
  if (!connectionString) {
    return undefined
  }

  try {
    const parsedUrl = new URL(connectionString)
    const pathname = parsedUrl.pathname.startsWith('/')
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.pathname

    return pathname ? decodeURIComponent(pathname) : undefined
  } catch {
    return undefined
  }
}

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
const defaultSslForConnection = Boolean(connectionString)
const shouldUseSsl = parseBooleanEnv(process.env.DB_SSL) ?? defaultSslForConnection
const rejectUnauthorized = parseBooleanEnv(process.env.DB_SSL_REJECT_UNAUTHORIZED) ?? false

export const baseDbConfig = {
  ...(connectionString
    ? {
        connectionString,
      }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parsePortEnv(process.env.DB_PORT),
      }),
  ...(shouldUseSsl
    ? {
        ssl: {
          rejectUnauthorized,
        },
      }
    : {}),
}

export const isConnectionStringMode = Boolean(connectionString)

const sharedDatabaseName = process.env.DB_NAME || parseDatabaseFromConnectionString(connectionString)
const defaultManagedDatabaseName = sharedDatabaseName || 'postgres'

export const databaseNames = {
  accounts: process.env.ACCOUNTS_DB_NAME || sharedDatabaseName || (isConnectionStringMode ? defaultManagedDatabaseName : 'inventory_accounts'),
  products: process.env.PRODUCTS_DB_NAME || sharedDatabaseName || (isConnectionStringMode ? defaultManagedDatabaseName : 'inventory_products'),
}

export const buildDbConfig = (database) => ({
  ...baseDbConfig,
  ...(database ? { database } : {}),
})

export const createPool = (database, label) => {
  const pool = new Pool(buildDbConfig(database))

  pool.on('error', (err) => {
    console.error(`Unexpected error on idle ${label} database client`, err)
  })

  return pool
}

export const accountsPool = createPool(databaseNames.accounts, 'accounts')
export const productsPool = createPool(databaseNames.products, 'products')

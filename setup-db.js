import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcryptjs'
import pkg from 'pg'
import { fileURLToPath } from 'url'
import { buildDbConfig, databaseNames, isConnectionStringMode } from './backend/db.js'

const { Client } = pkg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const schemaPaths = {
  accounts: path.join(__dirname, 'database', 'accounts_schema.sql'),
  products: path.join(__dirname, 'database', 'products_schema.sql'),
}

const quoteIdentifier = (value) => `"${String(value).replaceAll('"', '""')}"`
const legacyProductsDatabase = process.env.LEGACY_PRODUCTS_DB_NAME || 'inventory_products'
const canCreateDatabases = !isConnectionStringMode

const createClient = (database) => new Client(buildDbConfig(database))

const ensureDatabaseExists = async (database) => {
  const maintenanceClient = createClient('postgres')

  await maintenanceClient.connect()

  try {
    const result = await maintenanceClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database]
    )

    if (result.rowCount === 0) {
      await maintenanceClient.query(`CREATE DATABASE ${quoteIdentifier(database)}`)
      console.log(`Created database: ${database}`)
      return
    }

    console.log(`Database already exists: ${database}`)
  } finally {
    await maintenanceClient.end()
  }
}

const databaseExists = async (database) => {
  const maintenanceClient = createClient('postgres')

  await maintenanceClient.connect()

  try {
    const result = await maintenanceClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database]
    )

    return result.rowCount > 0
  } finally {
    await maintenanceClient.end()
  }
}

const applySchema = async (database, schemaPath) => {
  const schema = await fs.readFile(schemaPath, 'utf8')
  const client = createClient(database)

  await client.connect()

  try {
    await client.query(schema)
    console.log(`Applied schema to ${database}`)
  } finally {
    await client.end()
  }
}

const seedAccounts = async () => {
  const client = createClient(databaseNames.accounts)

  await client.connect()

  try {
    const adminPassword = await bcrypt.hash('admin123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    await client.query(
      `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE
        SET username = EXCLUDED.username,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = CURRENT_TIMESTAMP
      `,
      ['admin', 'admin@inventory.com', adminPassword, 'admin']
    )

    await client.query(
      `
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email) DO UPDATE
        SET username = EXCLUDED.username,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            updated_at = CURRENT_TIMESTAMP
      `,
      ['user', 'user@inventory.com', userPassword, 'user']
    )

    console.log('Seeded admin and user accounts')
  } finally {
    await client.end()
  }
}

const migrateLegacyProducts = async (targetDatabase) => {
  if (!canCreateDatabases) {
    return
  }

  if (legacyProductsDatabase === targetDatabase) {
    return
  }

  const legacyDatabaseAvailable = await databaseExists(legacyProductsDatabase)

  if (!legacyDatabaseAvailable) {
    return
  }

  const sourceClient = createClient(legacyProductsDatabase)
  const targetClient = createClient(targetDatabase)

  await sourceClient.connect()
  await targetClient.connect()

  try {
    const sourceProductsResult = await sourceClient.query(`
      SELECT
        p.item_number,
        p.name,
        p.description,
        p.quantity,
        p.low_stock_threshold,
        p.price,
        p.status,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        c.description AS category_description
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at, p.id
    `)

    let migratedProducts = 0

    for (const product of sourceProductsResult.rows) {
      let categoryId = null

      if (product.category_name) {
        const categoryResult = await targetClient.query(
          `
            INSERT INTO categories (name, description)
            VALUES ($1, $2)
            ON CONFLICT (name) DO UPDATE
            SET description = COALESCE(categories.description, EXCLUDED.description)
            RETURNING id
          `,
          [product.category_name, product.category_description || null]
        )

        categoryId = categoryResult.rows[0].id
      }

      const insertResult = await targetClient.query(
        `
          INSERT INTO products (
            item_number,
            name,
            description,
            category_id,
            quantity,
            low_stock_threshold,
            price,
            status,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (item_number) DO NOTHING
          RETURNING id
        `,
        [
          product.item_number,
          product.name,
          product.description,
          categoryId,
          product.quantity,
          product.low_stock_threshold,
          product.price,
          product.status,
          product.created_at,
          product.updated_at,
        ]
      )

      if (insertResult.rowCount > 0) {
        migratedProducts += 1
      }
    }

    if (migratedProducts > 0) {
      console.log(`Migrated ${migratedProducts} product(s) from ${legacyProductsDatabase} to ${targetDatabase}`)
    }
  } finally {
    await sourceClient.end()
    await targetClient.end()
  }
}

const setupDatabase = async () => {
  try {
    console.log('Preparing configured inventory databases...')

    if (canCreateDatabases) {
      await ensureDatabaseExists(databaseNames.accounts)

      if (databaseNames.products !== databaseNames.accounts) {
        await ensureDatabaseExists(databaseNames.products)
      }
    } else {
      console.log('Using a managed PostgreSQL connection (DATABASE_URL). Skipping CREATE DATABASE checks.')
    }

    await applySchema(databaseNames.accounts, schemaPaths.accounts)
    await applySchema(databaseNames.products, schemaPaths.products)
    await seedAccounts()
    await migrateLegacyProducts(databaseNames.products)

    console.log('')
    console.log('Accounts database:', databaseNames.accounts)
    console.log('Products database:', databaseNames.products)
    console.log('')
    console.log('Admin account:')
    console.log('  Email: admin@inventory.com')
    console.log('  Password: admin123')
    console.log('')
    console.log('User account:')
    console.log('  Email: user@inventory.com')
    console.log('  Password: user123')
    console.log('')
    console.log('Setup complete!')
  } catch (error) {
    console.error('Setup error:', error)
    process.exitCode = 1
  }
}

setupDatabase()

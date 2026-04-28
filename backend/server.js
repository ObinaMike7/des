import app from './app.js'
import { accountsPool, productsPool } from './db.js'

const getConfiguredDbHost = () => {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

  if (connectionString) {
    try {
      return new URL(connectionString).hostname
    } catch {
      return undefined
    }
  }

  return process.env.DB_HOST
}

const formatDbHint = (error) => {
  if (!error || error.code !== 'ENOTFOUND') {
    return null
  }

  const host = error.hostname || getConfiguredDbHost()

  if (!host) {
    return 'Database hostname could not be determined from env vars.'
  }

  if (String(host).includes('.supabase.co')) {
    return [
      `DNS could not resolve "${host}".`,
      'If you are using Supabase, double-check the connection string from the Supabase Dashboard → Project Settings → Database.',
      'This repo’s `.env.example` recommends using the Supabase pooler host (`*.pooler.supabase.com`) rather than `db.<project-ref>.supabase.co`.',
      'If you are offline / behind a VPN / have restricted DNS, fix DNS access or switch to a local PostgreSQL config (DB_HOST=localhost, etc.).',
    ].join(' ')
  }

  return `DNS could not resolve "${host}". Verify DB_HOST / DATABASE_URL and your network/DNS.`
}

const testPool = async (pool, label) => {
  try {
    await pool.query('SELECT 1')
    console.log(`Connected to ${label} database.`)
  } catch (error) {
    console.error(`Database connection check failed (${label}).`, error)
    const hint = formatDbHint(error)
    if (hint) {
      console.error(`Hint: ${hint}`)
    }
  }
}

await testPool(accountsPool, 'accounts')
if (productsPool !== accountsPool) {
  await testPool(productsPool, 'products')
}

// Start server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

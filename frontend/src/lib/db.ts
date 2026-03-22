import { Pool } from 'pg'

declare global {
  var _pgIndexerPool: Pool | undefined
}

function createPool(): Pool {
  // Use INDEXER_DATABASE_URL if set, otherwise fall back to DATABASE_URL
  const connectionString = process.env.INDEXER_DATABASE_URL
  if (!connectionString) {
    throw new Error('INDEXER_DATABASE_URL (or DATABASE_URL) environment variable is not set')
  }
  return new Pool({ connectionString })
}

// Reuse the pool across hot-reloads in dev
const pool: Pool = global._pgIndexerPool ?? createPool()
if (process.env.NODE_ENV !== 'production') {
  global._pgIndexerPool = pool
}

export default pool

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { Market, MarketsResponse } from '@/lib/types/market'

/**
 * Parses a Rust-indexed u128 string stored as TEXT in Postgres.
 * We divide by 2^64 to get a human-readable float.
 */
function parseU128(raw: string): number {
  try {
    const big = BigInt(raw)
    const divisor = BigInt(2) ** BigInt(64)
    const intPart = Number(big / divisor)
    const fracPart = Number(big % divisor) / Number(divisor)
    return intPart + fracPart
  } catch {
    return 0
  }
}

function parseU32(raw: string): number {
  return parseInt(raw ?? '0', 10) || 0
}

function parseRawMarket(row: Record<string, string>): Market {
  return {
    id: row.id,
    market_address: row.market_address,
    mint_address_a: row.mint_address_a,
    mint_address_b: row.mint_address_b,
    current_price: parseU128(row.current_price),
    current_tick: parseU32(row.current_tick),
    fees: parseU128(row.fees),
    active_liquidity: parseU128(row.active_liquidity),
    pool_address_a: row.pool_address_a,
    pool_address_b: row.pool_address_b,
    token_amount_a: row.token_amount_a ?? null,
    token_amount_b: row.token_amount_b ?? null,
  }
}

/** Cached once per server start: does the token_pool table exist? */
let tokenPoolExists: boolean | null = null

async function checkTokenPoolExists(): Promise<boolean> {
  if (tokenPoolExists !== null) return tokenPoolExists
  try {
    const res = await pool.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'token_pool' LIMIT 1`,
    )
    tokenPoolExists = res.rows.length > 0
  } catch {
    tokenPoolExists = false
  }
  return tokenPoolExists
}

/** Fetch actual column names from the markets table (cached) */
let marketColumns: string[] | null = null

async function getMarketColumns(): Promise<string[]> {
  if (marketColumns !== null) return marketColumns
  const res = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'markets' ORDER BY ordinal_position`,
  )
  marketColumns = res.rows.map((r: { column_name: string }) => r.column_name)
  return marketColumns
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)

    // Discover actual column names to build safe queries
    const cols = await getMarketColumns()
    // The PK is 'id' (uuid) in the markets table; must qualify it since token_pool also has 'id'
    const pkCol = cols.includes('id') ? `markets.id::text AS id` : `markets.market_address AS id`

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)))
    const offset = (page - 1) * limit

    // Search
    const search = searchParams.get('search')?.trim() ?? ''

    // Numeric filters
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const minLiquidity = searchParams.get('min_liquidity')
    const maxLiquidity = searchParams.get('max_liquidity')

    // Sort
    const sortField = searchParams.get('sort') ?? 'liquidity'
    const sortOrder = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC'
    const allowedSortFields: Record<string, string> = {
      price: 'current_price',
      liquidity: 'active_liquidity',
      fees: 'fees',
    }
    const dbSortField = allowedSortFields[sortField] ?? 'active_liquidity'

    // Build WHERE conditions
    const conditions: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = []
    let paramIdx = 1

    if (search) {
      conditions.push(
        `(market_address ILIKE $${paramIdx} OR mint_address_a ILIKE $${paramIdx} OR mint_address_b ILIKE $${paramIdx})`,
      )
      params.push(`%${search}%`)
      paramIdx++
    }

    if (minPrice !== null && !isNaN(Number(minPrice))) {
      const rawMinPrice = BigInt(Math.floor(Number(minPrice) * Number(BigInt(2) ** BigInt(64))))
      conditions.push(`CAST(current_price AS NUMERIC) >= $${paramIdx}`)
      params.push(rawMinPrice.toString())
      paramIdx++
    }
    if (maxPrice !== null && !isNaN(Number(maxPrice))) {
      const rawMaxPrice = BigInt(Math.ceil(Number(maxPrice) * Number(BigInt(2) ** BigInt(64))))
      conditions.push(`CAST(current_price AS NUMERIC) <= $${paramIdx}`)
      params.push(rawMaxPrice.toString())
      paramIdx++
    }

    if (minLiquidity !== null && !isNaN(Number(minLiquidity))) {
      const rawMin = BigInt(Math.floor(Number(minLiquidity) * Number(BigInt(2) ** BigInt(64))))
      conditions.push(`CAST(active_liquidity AS NUMERIC) >= $${paramIdx}`)
      params.push(rawMin.toString())
      paramIdx++
    }
    if (maxLiquidity !== null && !isNaN(Number(maxLiquidity))) {
      const rawMax = BigInt(Math.ceil(Number(maxLiquidity) * Number(BigInt(2) ** BigInt(64))))
      conditions.push(`CAST(active_liquidity AS NUMERIC) <= $${paramIdx}`)
      params.push(rawMax.toString())
      paramIdx++
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Make token_pool JOIN conditional
    const hasTokenPool = await checkTokenPoolExists()
    const tokenPoolJoin = hasTokenPool
      ? `LEFT JOIN token_pool tpa ON tpa.market_id = markets.id AND tpa.token_mint_address = markets.mint_address_a
         LEFT JOIN token_pool tpb ON tpb.market_id = markets.id AND tpb.token_mint_address = markets.mint_address_b`
      : ''
    const tokenPoolSelect = hasTokenPool
      ? `, tpa.token_amount AS token_amount_a, tpb.token_amount AS token_amount_b`
      : `, NULL AS token_amount_a, NULL AS token_amount_b`

    const dataQuery = `
      SELECT
        ${pkCol},
        market_address,
        mint_address_a,
        mint_address_b,
        current_price,
        current_tick,
        fees,
        active_liquidity,
        pool_address_a,
        pool_address_b
        ${tokenPoolSelect}
      FROM markets
      ${tokenPoolJoin}
      ${where}
      ORDER BY CAST(${dbSortField} AS NUMERIC) ${sortOrder}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM markets
      ${where}
    `

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...params, limit, offset]),
      pool.query(countQuery, params),
    ])

    const markets: Market[] = dataResult.rows.map(parseRawMarket)
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10)
    const totalPages = Math.ceil(total / limit)

    const response: MarketsResponse = {
      markets,
      total,
      page,
      limit,
      totalPages,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/markets] error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { Market } from '@/lib/types/market'

function parsePrice(raw: string): number {
  try {
    const big = BigInt(raw)
    const divisor = BigInt(2) ** BigInt(64)
    const val = Number(big) / Number(divisor)
    return val * val
  } catch {
    return 0
  }
}

function parseQty(raw: string): number {
  try {
    const big = BigInt(raw)
    const divisor = BigInt(2) ** BigInt(64)
    return Number(big) / Number(divisor)
  } catch {
    return 0
  }
}

function parseU32(raw: string): number {
  return parseInt(raw ?? '0', 10) || 0
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    // Fetch market by ID or market_address
    const query = `
      SELECT 
        m.id::text,
        m.market_address,
        m.mint_address_a,
        m.mint_address_b,
        m.current_price,
        m.current_tick,
        m.fees,
        m.active_liquidity,
        m.pool_address_a,
        m.pool_address_b,
        tpa.token_amount AS token_amount_a,
        tpb.token_amount AS token_amount_b
      FROM markets m
      LEFT JOIN token_pool tpa ON tpa.market_id = m.id AND tpa.token_mint_address = m.mint_address_a
      LEFT JOIN token_pool tpb ON tpb.market_id = m.id AND tpb.token_mint_address = m.mint_address_b
      WHERE m.id::text = $1 OR m.market_address = $1
      LIMIT 1
    `
    const { rows } = await pool.query(query, [id])

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    const row = rows[0]
    const market: Market = {
      id: row.id,
      market_address: row.market_address,
      mint_address_a: row.mint_address_a,
      mint_address_b: row.mint_address_b,
      current_price: parsePrice(row.current_price),
      current_tick: parseU32(row.current_tick),
      fees: parseQty(row.fees),
      active_liquidity: parseQty(row.active_liquidity),
      pool_address_a: row.pool_address_a,
      pool_address_b: row.pool_address_b,
      token_amount_a: row.token_amount_a ?? null,
      token_amount_b: row.token_amount_b ?? null,
    }

    return NextResponse.json(market)
  } catch (error) {
    console.error('[GET /api/markets/[id]] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

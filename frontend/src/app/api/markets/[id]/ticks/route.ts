import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    // Fetch active ticks for the market to build liquidity density profile
    // We join with markets to allow lookup by market_address too
    const query = `
      SELECT 
        at.tick_position,
        at.net_liquidity
      FROM active_ticks at
      JOIN markets m ON m.id = at.market_id
      WHERE m.id::text = $1 OR m.market_address = $1
      ORDER BY at.tick_position ASC
    `
    const { rows } = await pool.query(query, [id])
    console.log("rows:",rows);
    const ticks = rows.map(row => ({
      tick: row.tick_position,
      liquidity: parseU128(row.net_liquidity),
    }))
    console.log("ticks:",ticks);
    return NextResponse.json({ ticks })
  } catch (error) {
    console.error('[GET /api/markets/[id]/ticks] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

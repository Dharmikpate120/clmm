import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

function parseU128(raw: string): number {
  try {
    const big = BigInt(raw)
    const divisor = BigInt(2) ** BigInt(64)
    const intPart = Number(big / divisor)
    const fracPart = Number(big % divisor) / Number(divisor)
    return (intPart + fracPart) * (intPart + fracPart)
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
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '1D'

    // Resolve market ID
    const marketRes = await pool.query('SELECT id FROM markets WHERE id::text = $1 OR market_address = $1 LIMIT 1', [id])
    if (marketRes.rows.length === 0) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }
    const marketId = marketRes.rows[0].id

    let timeInterval = '1 day'

    switch (range) {
      case '1H':
        timeInterval = '1 hour'
        break
      case '1D':
        timeInterval = '1 day'
        break
      case '1W':
        timeInterval = '7 days'
        break
      case '1M':
        timeInterval = '30 days'
        break
      case '1Y':
        timeInterval = '1 year'
        break
    }

    const query = `
      SELECT price, created_at 
      FROM transactions 
      WHERE market_address = $1 AND created_at >= NOW() - INTERVAL '${timeInterval}'
      ORDER BY created_at ASC
    `
    const { rows } = await pool.query(query, [marketId])

    const history = rows.map(r => ({
      time: r.created_at,
      price: parseU128(r.price)
    }))

    return NextResponse.json(history)
  } catch (error) {
    console.error('[GET /api/markets/[id]/price-history] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

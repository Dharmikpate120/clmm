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
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = searchParams.get('days')

    // Find market UUID
    const marketQuery = `
      SELECT id FROM markets 
      WHERE id::text = $1 OR market_address = $1
      LIMIT 1
    `
    const marketRes = await pool.query(marketQuery, [id])
    if (marketRes.rows.length === 0) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }
    const marketId = marketRes.rows[0].id

    // Fetch transactions
    // Fetch limit + 1 to calculate direction for the last displayed transaction
    let query = `
      SELECT * 
      FROM transactions 
      WHERE market_address = $1
    `
    const queryParams: (string | number)[] = [marketId]

    if (days) {
      query += ` AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'`
    }

    query += ` ORDER BY created_at DESC LIMIT $2`
    queryParams.push(limit + 1)

    const { rows } = await pool.query(query, queryParams)

    const transactions = rows.slice(0, limit).map((row, index) => {
      const currentPrice = parseU128(row.price)
      let direction: 'up' | 'down' | 'same' = 'same'
      
      const nextRow = rows[index + 1]
      if (nextRow) {
        const prevPrice = parseU128(nextRow.price)
        if (currentPrice > prevPrice) direction = 'up'
        else if (currentPrice < prevPrice) direction = 'down'
      }

      return {
        ...row,
        price_num: currentPrice,
        direction,
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('[GET /api/markets/[id]/transactions] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

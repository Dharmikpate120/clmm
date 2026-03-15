import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { Position } from '@/lib/types/position'

function parseU128(raw: string): number {
  try {
    const big = BigInt(raw.split(".")[0])
    const divisor = BigInt(2) ** BigInt(64)
    const intPart = Number(big / divisor)
    const fracPart = Number(big % divisor) / Number(divisor)
    return intPart + fracPart
  } catch (err) {
    console.log(err);
    return 0
  }
}

function parseTick(raw: string): number {
  return parseInt(raw ?? '0', 10) || 0
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user_address')
    const marketId = searchParams.get('market_id') // Optional filter

    if (!userAddress) {
      return NextResponse.json({ error: 'user_address is required' }, { status: 400 })
    }

    let query = `
      SELECT 
        id::text,
        user_address,
        nft_address,
        position_address,
        start_tick,
        end_tick,
        liquidity
      FROM position_accounts
      WHERE user_address = $1
      `
    const params: string[] = [
      userAddress
    ]

    if (marketId) {
      query += ` AND market_id = $2;`
      params.push(marketId)
    }
    console.log(marketId)
    const { rows } = await pool.query(query, params)
    console.log(rows)
    const positions: Position[] = rows.map(row => ({
      id: row.id,
      user_address: row.user_address,
      nft_address: row.nft_address,
      position_address: row.position_address,
      start_tick: parseTick(row.start_tick),
      end_tick: parseTick(row.end_tick),
      liquidity: parseFloat(row.liquidity),
    }))

    return NextResponse.json({ positions })
  } catch (error) {
    console.error('[GET /api/user/positions] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

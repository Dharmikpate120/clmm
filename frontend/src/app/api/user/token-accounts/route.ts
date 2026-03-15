import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { TokenAccount } from '@/lib/types/position'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('user_address')

    if (!userAddress) {
      return NextResponse.json({ error: 'user_address is required' }, { status: 400 })
    }

    const query = `
      SELECT 
        id::text,
        user_address,
        token_mint_address,
        token_address,
        balance
      FROM user_token_accounts
      WHERE user_address = $1
    `
    const { rows } = await pool.query(query, [userAddress])

    const tokenAccounts: TokenAccount[] = rows.map(row => ({
      id: row.id,
      user_address: row.user_address,
      token_mint_address: row.token_mint_address,
      token_address: row.token_address,
      balance: row.balance,
    }))

    return NextResponse.json({ tokenAccounts })
  } catch (error) {
    console.error('[GET /api/user/token-accounts] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

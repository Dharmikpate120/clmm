/**
 * Market as returned by GET /api/markets
 *
 * Numeric fields that are stored as TEXT by the Rust indexer are parsed
 * and returned as JavaScript numbers here.
 *
 * Raw on-chain types (from handle_accounts.rs / state.rs):
 *   current_price   → sqrt_price_a_by_b  (u128 stored as decimal string)
 *   current_tick    → current_tick        (u32  stored as decimal string)
 *   fees            → fee_growth          (u128 stored as decimal string)
 *   active_liquidity→ active_liquidity    (u128 stored as decimal string)
 *   token_amount_*  → SPL token amount    (u64  stored as decimal string)
 */
export type Market = {
  id: string
  market_address: string
  mint_address_a: string
  mint_address_b: string
  /** sqrt(price A/B) as a floating-point number (raw u128 / 2^64) */
  current_price: number
  /** current tick index (raw u32) */
  current_tick: number
  /** fee growth accumulator (raw u128 / 2^64) */
  fees: number
  /** total active liquidity (raw u128 / 2^64) */
  active_liquidity: number
  pool_address_a: string
  pool_address_b: string
  /** SPL token amount for mint A from the token_pool table */
  token_amount_a: string | null
  /** SPL token amount for mint B from the token_pool table */
  token_amount_b: string | null
}

export type MarketsResponse = {
  markets: Market[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * User position as returned by GET /api/user/positions
 */
export type Position = {
  id: string
  user_address: string
  /** The special NFT that represents this position on-chain */
  nft_address: string
  /** The literal PDA address of the position account */
  position_address: string
  /** Lower tick boundary (parsed from TEXT) */
  start_tick: number
  /** Upper tick boundary (parsed from TEXT) */
  end_tick: number
  /** Amount of liquidity in the position (parsed from TEXT u128 / 2^64) */
  liquidity: number
}

/**
 * User token balance as returned by GET /api/user/token-accounts
 */
export type TokenAccount = {
  id: string
  user_address: string
  token_mint_address: string
  token_address: string
  /** Current balance (raw string from TEXT) */
  balance: string
}

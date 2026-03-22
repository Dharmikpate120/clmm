import { Address } from 'gill'

export type AmmAccountData = {
  token_a_mint_account: string
  token_b_mint_account: string
  admin_token_a_account: string
  admin_token_b_account: string
  token_a_amount: string
  token_b_amount: string
  start_tick: string
  end_tick: string
  admin_account: string
  // nft_signer: string
}
export type AmmAddLiquidity = {
  token_a_mint_account: string
  token_b_mint_account: string
  provider_token_a_account: string
  provider_token_b_account: string
  // amount_a_max: string
  // amount_b_max: string
  liquidity: string
  start_tick: string
  end_tick: string
  provider_account: string
}

export type AmmWithdrawLiquidity = {
  token_a_mint_account: string
  token_b_mint_account: string
  amm_token_account: string
  provider_token_a_account: string
  provider_token_b_account: string
  minimum_liquidity: string
  provider_account: string
  nft_mint_account: string
}

export type SwapTokens = {
  swapper_token_a_account: string
  swapper_token_b_account: string
  token_a_mint_account: string
  token_b_mint_account: string
  token_in_mint: string
  token_out_mint:string
  max_amount_in: string
  minimum_amount_out: string
  swapper_account: string
  ticks: TickData[]
}

export type clmmTokenAccountType = {
  pool_authority: Address<string>
  token_a_mint: Address<string>
  token_b_mint: Address<string>
  token_a_pool: Address<string>
  token_b_pool: Address<string>
  sqrt_price_a_by_b: bigint
  current_tick: number
  active_liquidity: bigint
  fee_growth: bigint
  protocol_fee: bigint
}

export type TickData = {
    tick: number;
    liquidity: number;
};

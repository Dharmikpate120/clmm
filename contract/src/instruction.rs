use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ msg, program_error::ProgramError, pubkey::Pubkey };

#[derive(BorshDeserialize, BorshSerialize)]
pub enum AMMInstruction {
    //accounts Indexes: InitializeTokenPool
    // 0. admin account (signer, writable)
    // 1. system program account: 11111111111111111111111111111111 (read only)
    // 2. spl token program account: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (read only)
    // 3. token A mint account (read only)
    // 4. token B mint account (read only)
    // 5. admin token A account (writable)
    // 6. admin token B account (writable)
    // 7. lp_token_mint_account (writable)
    // 8. admin lp token account (writable)
    // 9. token A pool account (writable)
    // 10. token B pool account (writable)
    // 11. amm_token_account (writable)
    // 12. sysvar_rent_account : SysvarRent111111111111111111111111111111111 (read only)
    //13. amm_program_account (read only)
    //14. nft_mint_account (writable)
    //15. nft_token_account (writable)
    //16. metaplex_core_program_account(read only)
    //17. possition_account(writable)
    //18.first_tick_array_account(writable)
    //19.last_tick_array_account(writable)

    //
    InitializeTokenPool {
        token_a_amount: u64,
        token_b_amount: u64,
        start_tick: u32,
        end_tick: u32,
    },

    //1. liquidity_provider_account(signer, writable)
    //2.spl_token_account (readonly)
    //3. amm_token_account(writable)
    //4. amm_token_a_pool_account(writable)
    //5. amm_token_b_pool_account(writable)
    //6. provider_token_a_account(writabler)
    //7. provider_token_b_account(writable)
    //8. provider_lp_token_account(writable)
    //9. lp_token_mint_account(writable)
    //10.sysvar_rent_account (readonly)
    //11. token_a_mint_account(read only)
    //12. token_b_mint_account(read only)
    //13. system_program_account(read only)
    //14. amm_program_account (read only)

    // Index 0: GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3
    // Index 1: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
    // Index 2: 8HQanjD9QxL2dDC3aSZMW6VoyeRkZTK43wKpzhEwhExJ
    // Index 3: BngwetXKv5uZVHAdta3SoY2n7BNqdtMPHUH4doiRR6tT
    // Index 4: AkZGSWn8wZqwPQ5uuaUpvVDBSHf2b7RimiqrFUYWjYRd
    // Index 5: cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt
    // Index 6: ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn
    // Index 7: FH9rq1XEwdnxW1SF5qK98n8mAg9M6PgTtzGpiwwjhBN1
    // Index 8: 9NQG7n9W4oKAkYwQqAerpnm9uXd1eN387tTvvcWrFSWb
    // Index 9: SysvarRent111111111111111111111111111111111
    // Index 10: 6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd
    // Index 11: DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP
    // Index 12: 11111111111111111111111111111111
    // Index 13: DzJJz3MQJeqgfGePLndCFG64M8zKJAKaWHYgTzXfuPnZ
    AddLiquidity {
        amount_a_max: u64,
        amount_b_max: u64,
        minimum_lp_tokens: u64,
    },

    //1. liquidity_provider_account(signer, writable)
    //2. spl_token_account (readonly)
    //3. amm_token_account(writable)
    //4. amm_token_a_pool_account(writable)
    //5. amm_token_b_pool_account(writable)
    //6. provider_token_a_account(writable)
    //7. provider_token_b_account(writable)
    //8. provider_lp_token_account(writable)
    //9. lp_token_mint_account(writable)
    //10.sysvar_rent_account (readonly)
    //11. token_a_mint_account(read only)
    //12. token_b_mint_account(read only)
    //13. system_program_account(read only)
    //14. amm_program_account (read only)

    WithdrawLiquidity {
        amount_a_min: u64,
        amount_b_min: u64,
        maximum_lp_tokens: u64,
    },
    //0. swapper_account(signer, writable)
    //1. spl_token_account (readonly)
    //2. amm_token_account(writable)
    //3. amm_token_a_pool_account(writable)
    //4. amm_token_b_pool_account(writable)
    //5. swapper_token_a_account(writable)
    //6. swapper_token_b_account(writable)
    //7. token_a_mint_account(read only)
    //8. token_b_mint_account(read only)
    //9. system_program_account(read only)
    //10. amm_program_account (read only)
    Swap {
        amount_in: u64,
        minimum_amount_out: u64,
        mint_address_in: Pubkey,
        mint_address_out: Pubkey,
    },

    InitializeTradingAccount,
}

impl AMMInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        Self::try_from_slice(input).map_err(|_| {
            msg!("Error: Failed to deserialize instruction data");
            ProgramError::InvalidInstructionData
        })
    }
}

use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ msg, program_error::ProgramError, pubkey::Pubkey };

#[derive(BorshDeserialize, BorshSerialize)]
pub enum AMMInstruction {
    //accounts Indexes: InitializeTokenPool
    // 0. admin account (signer, writable)
    // 1. nft_mint_account (writable)
    // 2. spl token program account: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (read only)
    // 3. token A mint account (read only)
    // 4. token B mint account (read only)
    // 5. admin token A account (writable)
    // 6. admin token B account (writable)
    // 7. token A pool account (writable)
    // 8. token B pool account (writable)
    // 9. amm_token_account (writable)
    // 10. sysvar_rent_account : SysvarRent111111111111111111111111111111111 (read only)
    //11. amm_program_account (read only)
    //12. system program account: 11111111111111111111111111111111 (read only)
    //13. metaplex_core_program_account(read only)
    //14. position_account(writable)
    //15.first_tick_array_account(writable)
    //16.last_tick_array_account(writable)
    //17. start_bitmap_account(writable)
    //18. end_bitmap_account(writable)

    // 
    InitializeTokenPool {
        token_a_amount: u64,
        token_b_amount: u64,
        start_tick: u32,
        end_tick: u32,
    },

    //1. liquidity_provider_account(signer, writable)
    //2. spl_token_account (readonly)
    //3. amm_token_account(writable)
    //4. amm_token_a_pool_account(writable)
    //5. amm_token_b_pool_account(writable)
    //6. provider_token_a_account(writabler)
    //7. provider_token_b_account(writable)
    //8. nft_mint_account(writable)
    //9. lp_token_mint_account(writable)
    //10. sysvar_rent_account (readonly)
    //11. token_a_mint_account(read only)
    //12. token_b_mint_account(read only)
    //13. system_program_account(read only)
    //14. amm_program_account (read only)
    //15. metaplex_core_program_account(read only)
    //16. position_account(writable)
    //17. first_tick_array_account(writable)
    //18. last_tick_array_account(writable)

    AddLiquidity {
        liquidity: f64,
        start_tick: u32,
        end_tick: u32,
    },

    //1. liquidity_provider_account(signer, writable)
    //2. spl_token_account (readonly)
    //3. amm_token_account(writable)
    //4. amm_token_a_pool_account(writable)
    //5. amm_token_b_pool_account(writable)
    //6. provider_token_a_account(writable)
    //7. provider_token_b_account(writable)
    //8. nft_mint_account(writable)
    //9. lp_token_mint_account(writable)
    //10.sysvar_rent_account (readonly)
    //11. token_a_mint_account(read only)
    //12. token_b_mint_account(read only)
    //13. system_program_account(read only)
    //14. amm_program_account (read only)
    //15. metaplex_core_program_account(read only)
    //16. position_account(writable)
    //17. first_tick_array_account(writable)
    //18. last_tick_array_account(writable)

    WithdrawLiquidity {
        minimum_liquidity: u64,
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
    //11. bitmap_account_one: (read only)
    //12. bitmap_account_two: (read only)
    //13. tick_array_account_one (read only)
    //14. tick_array_account_two (read only)
    //15. tick_array_account_three (read only)
    //16. tick_array_account_four (read only)
    Swap {
        amount_in: u64,
        minimum_amount_out: u64,
        mint_address_in: Pubkey,
        mint_address_out: Pubkey,
        // bitmap_account_number: u32,
        // tick_account_number: u32
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

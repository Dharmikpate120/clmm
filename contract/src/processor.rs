use std::{ slice::Iter };

use crate::{
    bitmap::{
        bitmaphelper::{
            activate_bit,
            check_bit_status_u8,
            deactivate_bit,
            get_bitarray_index,
            get_tail,
        },
        bitmapstate::Bitmap,
    },
    delta::delta_helper::{ price_with_a_and_liquidity, price_with_b_and_liquidity },
    error::AMMError,
    formulas::{
        calculate_delta_a,
        calculate_delta_b,
        price_to_tick_index,
        q6464_sqrt_to_value,
        tick_index_to_price,
        value_to_sqrt_q6464,
    },
    state::{ AMMAccount, PositionAccount, TICK_ARRAY_SIZE },
    tick_state::{ TickArray, TickState },
};
// use mpl_core::types::DataState;
use solana_program::{
    account_info::{ AccountInfo, next_account_info },
    entrypoint::ProgramResult,
    instruction::{ AccountMeta },
    msg,
    program::invoke,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};
use solana_program::program_pack::Pack;
use solana_program_error::ProgramError;
use spl_token_interface::state::AccountState;
use borsh::{ BorshDeserialize, BorshSerialize };
pub struct Processor;

impl Processor {
    pub fn initialize_token_pool_account(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        token_a_amount: u64,
        token_b_amount: u64,
        start_tick: u32,
        end_tick: u32
    ) -> ProgramResult {
        let account_iter = &mut accounts.iter();

        // 0. admin account (signer, writable)
        let admin_account = next_account_info(account_iter)?;

        // 1. nft_mint_account (signer, writable)
        let nft_mint_account = next_account_info(account_iter)?;

        // 2. spl token program account: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (read only)
        let spl_token_program_account = next_account_info(account_iter)?;

        // 3. token A mint account (read only)
        let token_a_mint_account = next_account_info(account_iter)?;

        // 4. token B mint account (read only)
        let token_b_mint_account = next_account_info(account_iter)?;

        // 5. admin token A account (writable)
        let admin_token_a_account = next_account_info(account_iter)?;

        // 6. admin token B account (writable)
        let admin_token_b_account = next_account_info(account_iter)?;

        // 7. token A pool account (writable)
        let token_a_pool_account = next_account_info(account_iter)?;

        // 8. token B pool account (writable)
        let token_b_pool_account = next_account_info(account_iter)?;

        // 9. amm_token_account (writable)
        let amm_token_account = next_account_info(account_iter)?;

        // 10. sysvar_rent_account : SysvarRent111111111111111111111111111111111 (read only)
        let sysvar_rent_account = next_account_info(account_iter)?;

        //11. amm_program_account (read only)
        let amm_program_account = next_account_info(account_iter)?;

        //12. system program account: 11111111111111111111111111111111 (read only)
        let system_program_account = next_account_info(account_iter)?;

        //13. metaplex_core_program_account(read only)
        let metaplex_core_program_account = next_account_info(account_iter)?;

        //14. position_account(writable)
        let position_account = next_account_info(account_iter)?;

        //15.first_tick_array_account(writable)
        let first_tick_array_account = next_account_info(account_iter)?;

        //16.last_tick_array_account
        let last_tick_array_account = next_account_info(account_iter)?;

        //17. start_bitmap_account
        let start_bitmap_account = next_account_info(account_iter)?;
        //18. end_bitmap_account
        let end_bitmap_account = next_account_info(account_iter)?;

        //verifying accounts access--------------------------------------------------------------------------------------
        if admin_account.is_signer == false {
            msg!("Error: Admin account is not a signer");
            return Err(AMMError::InvalidSigner.into());
        }

        if *system_program_account.key != solana_system_interface::program::ID {
            msg!(
                "Error: System program account is invalid: {:?}",
                solana_system_interface::program::ID
            );
            return Err(AMMError::InvalidSystemProgram.into());
        }

        if *spl_token_program_account.key != spl_token_interface::id() {
            msg!("Error: SPL token program account is invalid");
            return Err(AMMError::InvalidSPLTokenProgram.into());
        }
        // if *metaplex_core_program_account.key.to_string() != mpl_core::ID.to_string() {
        //     msg!("Error: Metaplex core program account is invalid");
        //     return Err(AMMError::InvalidMPL_CoreProgram.into());
        // }
        if admin_token_a_account.is_writable == false || admin_token_b_account.is_writable == false {
            msg!("Error: Admin token A account is not writable");
            return Err(AMMError::NotWritable.into());
        }

        if token_a_pool_account.is_writable == false || token_b_pool_account.is_writable == false {
            msg!("Error: Token pool accounts are not writable!");
            return Err(AMMError::NotWritable.into());
        }
        if amm_token_account.is_writable == false {
            msg!("Error: AMM token accoutn is not writable!");
            return Err(AMMError::NotWritable.into());
        }

        if nft_mint_account.is_writable == false {
            msg!("Error: nft mint account is not writable");
            return Err(AMMError::NotWritable.into());
        }

        if position_account.is_writable == false {
            msg!("Error: position account is not writable");
            return Err(AMMError::NotWritable.into());
        }
        if
            first_tick_array_account.is_writable == false ||
            last_tick_array_account.is_writable == false
        {
            msg!("Error: tick array account is not writable");
            return Err(AMMError::NotWritable.into());
        }

        //verifying accounts data--------------------------------------------------------------------------------------
        msg!("1");
        let admin_token_a_data = spl_token_interface::state::Account::unpack_from_slice(
            admin_token_a_account.data.borrow().as_ref()
        )?;
        if admin_token_a_data.is_frozen() {
            msg!("Error: Admin token A account is frozen");
            return Err(AMMError::TokenAccountFrozen.into());
        }
        if admin_token_a_data.state != AccountState::Initialized {
            msg!("Error: Admin token A account is not initialized");
            return Err(AMMError::TokenAccountFrozen.into());
        }

        let admin_token_b_data = spl_token_interface::state::Account::unpack_from_slice(
            admin_token_b_account.data.borrow().as_ref()
        )?;
        if admin_token_b_data.is_frozen() {
            msg!("Error: Admin token A account is frozen");
            return Err(AMMError::TokenAccountFrozen.into());
        }
        if admin_token_b_data.state != AccountState::Initialized {
            msg!("Error: Admin token A account is not initialized");
            return Err(AMMError::TokenAccountNotInitialized.into());
        }

        if admin_token_a_data.amount < token_a_amount || admin_token_b_data.amount < token_b_amount {
            msg!("Error: Insufficient token balance in admin account");
            return Err(AMMError::InsufficientTokenBalance.into());
        }

        if *token_a_mint_account.key != admin_token_a_data.mint {
            msg!("Error: Admin token A account mint does not match provided token A mint account");
            return Err(AMMError::InvalidMintAccount.into());
        }
        if *token_b_mint_account.key != admin_token_b_data.mint {
            msg!("Error: Admin token B account mint does not match provided token B mint account");
            return Err(AMMError::InvalidMintAccount.into());
        }
        msg!("1");
        //initializing amm pool account--------------------------------------------------------------------------------------
        //validating amm token account
        let (amm_token_account_pda, amm_token_account_bump) = get_lexicographical_token_pda(
            token_a_mint_account.key,
            token_b_mint_account.key,
            program_id
        );
        if amm_token_account_pda != *amm_token_account.key {
            msg!("Error: Invalid AMM token account provided.");
            return Err(AMMError::InvalidAMMTokenAccount.into());
        }
        msg!("1");
        //creating and initializing amm pool account
        initialize_amm_pool_account(
            admin_account,
            program_id,
            amm_token_account,
            amm_token_account_bump,
            system_program_account,
            spl_token_program_account,
            token_a_mint_account.key,
            token_b_mint_account.key,
            token_a_pool_account.key,
            token_b_pool_account.key
        )?;
        //INITIALIZE BITMAP ARRAY ACCOUNTS
        let start_bitmap_index = start_tick / 80000;
        let end_bitmap_index = end_tick / 80000;
        msg!("1");
        if start_bitmap_index == end_bitmap_index {
            let (start_bitmap_address, start_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &start_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            msg!("{:?}", start_bitmap_address);
            initialize_bitmap_account(
                start_bitmap_account,
                start_bitmap_account_bump,
                admin_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                start_bitmap_index,
                program_id
            )?;
        } else {
            msg!("3");
            let (_start_bitmap_address, start_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &start_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            let (_end_bitmap_address, end_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &end_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            initialize_bitmap_account(
                start_bitmap_account,
                start_bitmap_account_bump,
                admin_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                start_bitmap_index,program_id
            )?;
            initialize_bitmap_account(
                end_bitmap_account,
                end_bitmap_account_bump,
                admin_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                end_bitmap_index,program_id
            )?;
            activate_bit(&mut start_bitmap_account.data.borrow_mut(), start_tick as u64);
            activate_bit(&mut end_bitmap_account.data.borrow_mut(), end_tick as u64);
        }
        msg!("1");
        //INITIALIZING TOKEN POOL ACCOUNTS--------------------------------------------------------------------------------------
        //validating token a pool account
        let (token_a_pool_account_pda, token_a_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_a_mint_account.key.as_array()],
            program_id
        );
        if token_a_pool_account_pda != *token_a_pool_account.key {
            msg!("Error: Invalid token A pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }
        //validating token b pool account
        let (token_b_pool_account_pda, token_b_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_b_mint_account.key.as_array()],
            program_id
        );
        if token_b_pool_account_pda != *token_b_pool_account.key {
            msg!("Error: Invalid token B pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }
        initialize_token_pool_accounts(
            admin_account,
            program_id,
            &amm_token_account_pda,
            system_program_account,
            spl_token_program_account,
            token_a_mint_account,
            token_b_mint_account,
            token_a_pool_account,
            token_b_pool_account,
            token_a_pool_account_bump,
            token_b_pool_account_bump,
            amm_token_account,
            sysvar_rent_account,
            amm_program_account
        )?;
        msg!("1");
        //Creating NFT accounts--------------------------------------------------------------------------------------

        initialize_nft_accounts(
            nft_mint_account,
            admin_account,
            system_program_account,
            metaplex_core_program_account
        )?;

        //move this below the calculation to directly set the state asdfghjkl;
        //Creating Position Account--------------------------------------------------------------------------------------
        let mut pa_seeds: Vec<&[u8]> = vec![nft_mint_account.key.as_array()];
        msg!("1");
        let (position_account_pda, position_account_bump) = Pubkey::find_program_address(
            get_lexicographical_tokens_addresses(
                token_a_mint_account.key,
                token_b_mint_account.key,
                &mut pa_seeds
            ),
            amm_program_account.key
        );
        if position_account_pda != *position_account.key {
            msg!("Error: Invalid position account provided.");
            return Err(AMMError::InvalidPositionAccount.into());
        }

        //collecting token a and token b in pool account--------------------------------------------------------------------------------------
        let token_a_admin_to_pool_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_program_account.key,
            admin_token_a_account.key,
            token_a_pool_account.key,
            admin_account.key,
            &[admin_account.key],
            token_a_amount
        )?;
        solana_program::program::invoke(
            &token_a_admin_to_pool_transfer_instruction,
            &[
                spl_token_program_account.clone(),
                admin_token_a_account.clone(),
                token_a_pool_account.clone(),
                admin_account.clone(),
            ]
        )?;
        msg!("1");
        let token_b_admin_to_pool_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_program_account.key,
            admin_token_b_account.key,
            token_b_pool_account.key,
            admin_account.key,
            &[admin_account.key],
            token_b_amount
        )?;
        solana_program::program::invoke(
            &token_b_admin_to_pool_transfer_instruction,
            &[
                spl_token_program_account.clone(),
                admin_token_b_account.clone(),
                token_b_pool_account.clone(),
                admin_account.clone(),
            ]
        )?;
        msg!("1");
        //calculate the initial price is between start and end tick of the provided range and create start tick and end tick array accounts set the active liquidity accordingly based on the start and end tick
        let price_a_by_b = (token_a_amount as f64) / (token_b_amount as f64);

        let current_tick = price_to_tick_index(price_a_by_b);

        if current_tick < (start_tick as u32) || current_tick > (end_tick as u32) {
            msg!("Error : Initial price is not in between the provided tick range.");
            return Err(AMMError::InitialPriceOutOfRange.into());
        }
        let active_liquidity = value_to_sqrt_q6464(
            ((token_a_amount as f64) * (token_b_amount as f64)).sqrt()
        );
        msg!("1");
        initialize_position_account(
            position_account,
            admin_account,
            system_program_account,
            amm_program_account,
            nft_mint_account,
            token_a_mint_account,
            token_b_mint_account,
            position_account_bump,
            start_tick,
            end_tick,
            active_liquidity
        )?;

        initialize_tick_array_accounts(
            first_tick_array_account,
            last_tick_array_account,
            admin_account,
            system_program_account,
            amm_program_account,
            amm_token_account,
            start_tick,
            end_tick,
            active_liquidity
        )?;

        let q6464_sqrt_price = value_to_sqrt_q6464(price_a_by_b);
        msg!("1");
        // updating data of amm token account
        let updated_amm_token_account_data = AMMAccount::Initialized {
            pool_authority: *program_id,
            token_a_mint: *token_a_mint_account.key,
            token_b_mint: *token_b_mint_account.key,
            token_a_pool: *token_a_pool_account.key,
            token_b_pool: *token_b_pool_account.key,
            sqrt_price_a_by_b: q6464_sqrt_price,
            current_tick,
            active_liquidity,
            fee_growth: 0,
            protocol_fee: 0,
        };
        updated_amm_token_account_data.pack_into_slice(&mut amm_token_account.data.borrow_mut());

        Ok(())
    }

    pub fn add_liquidity(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        liquidity: f64,
        start_tick: u32,
        end_tick: u32
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();

        //1. liquidity_provider_account(signer, writable)
        let liquidity_provider_account: &AccountInfo<'_> = next_account_info(accounts_iter)?;

        //2.spl_token_account (readonly)
        let spl_token_account = next_account_info(accounts_iter)?;

        //3. amm_token_account(writable)
        let amm_token_account = next_account_info(accounts_iter)?;

        //4. amm_token_a_pool_account(writable)
        let amm_token_a_pool_account = next_account_info(accounts_iter)?;

        //5. amm_token_b_pool_account(writable)
        let amm_token_b_pool_account = next_account_info(accounts_iter)?;

        //6. provider_token_a_account(writabler)
        let provider_token_a_account = next_account_info(accounts_iter)?;

        //7. provider_token_b_account(writable)
        let provider_token_b_account = next_account_info(accounts_iter)?;
        //8. nft_mint_account(writable)
        let nft_mint_account = next_account_info(accounts_iter)?;

        //9. lp_token_mint_account(writable)
        let lp_token_mint_account = next_account_info(accounts_iter)?;

        //10.sysvar_rent_account (readonly)
        let sysvar_rent_account = next_account_info(accounts_iter)?;

        //11. token_a_mint_account(read only)
        let token_a_mint_account = next_account_info(accounts_iter)?;

        //12. token_b_mint_account(read only)
        let token_b_mint_account = next_account_info(accounts_iter)?;

        //13. system_program_account(read only)
        let system_program_account = next_account_info(accounts_iter)?;

        //14. amm_program_account (read only)
        let amm_program_account = next_account_info(accounts_iter)?;

        //15. metaplex_core_program_account(read only)
        let metaplex_core_program_account = next_account_info(accounts_iter)?;

        //16. position_account(writable)
        let position_account = next_account_info(accounts_iter)?;

        //17. first_tick_array_account(writable)
        let first_tick_array_account = next_account_info(accounts_iter)?;

        //18. last_tick_array_account(writable)
        let last_tick_array_account = next_account_info(accounts_iter)?;

        //19. start_bitmap_account
        let start_bitmap_account = next_account_info(accounts_iter)?;

        //20. end_bitmap_account
        let end_bitmap_account = next_account_info(accounts_iter)?;

        //validating amm token account
        let (amm_token_account_pda, _amm_token_account_bump) = get_lexicographical_token_pda(
            token_a_mint_account.key,
            token_b_mint_account.key,
            program_id
        );
        if amm_token_account_pda != *amm_token_account.key {
            msg!("Error: Invalid AMM token account provided.");
            return Err(AMMError::InvalidAMMTokenAccount.into());
        }

        //validating token a pool account
        let (token_a_pool_account_pda, _token_a_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_a_mint_account.key.as_array()],
            program_id
        );
        if token_a_pool_account_pda != *amm_token_a_pool_account.key {
            msg!("Error: Invalid token A pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }

        //validating token b pool account
        let (token_b_pool_account_pda, _token_b_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_b_mint_account.key.as_array()],
            program_id
        );
        if token_b_pool_account_pda != *amm_token_b_pool_account.key {
            msg!("Error: Invalid token B pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }

        //INITIALIZE BITMAP ARRAY ACCOUNTS
        let start_bitmap_index = start_tick / 80000;
        let end_bitmap_index = end_tick / 80000;

        if start_bitmap_index == end_bitmap_index {
            let (_start_bitmap_address, start_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &start_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            initialize_bitmap_account(
                start_bitmap_account,
                start_bitmap_account_bump,
                liquidity_provider_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                start_bitmap_index,program_id
            )?;
        } else {
            let (_start_bitmap_address, start_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &start_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            let (_end_bitmap_address, end_bitmap_account_bump) = Pubkey::find_program_address(
                &[b"bitmap", &end_bitmap_index.to_be_bytes(), amm_token_account_pda.as_array()],
                amm_program_account.key
            );
            initialize_bitmap_account(
                start_bitmap_account,
                start_bitmap_account_bump,
                liquidity_provider_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                start_bitmap_index,program_id
            )?;
            initialize_bitmap_account(
                end_bitmap_account,
                end_bitmap_account_bump,
                liquidity_provider_account,
                system_program_account,
                amm_program_account,
                &amm_token_account_pda,
                end_bitmap_index,program_id
            )?;
            activate_bit(&mut start_bitmap_account.data.borrow_mut(), start_tick as u64);
            activate_bit(&mut end_bitmap_account.data.borrow_mut(), end_tick as u64);
        }
        //Creating NFT accounts--------------------------------------------------------------------------------------

        initialize_nft_accounts(
            nft_mint_account,
            liquidity_provider_account,
            system_program_account,
            metaplex_core_program_account
        )?;
        //calculations starts ------------------------------------------------------------

        let amm_token_account_data = AMMAccount::unpack_from_slice(
            &amm_token_account.data.borrow()
        )?;
        let start_price = tick_index_to_price(start_tick);
        let end_price = tick_index_to_price(end_tick);

        let AMMAccount::Initialized {
            pool_authority: _,
            token_a_mint: _,
            token_b_mint: _,
            token_a_pool: _,
            token_b_pool: _,
            sqrt_price_a_by_b,
            current_tick: _,
            active_liquidity: _,
            fee_growth: _,
            protocol_fee: _,
        } = amm_token_account_data else {
            msg!("Amm token account not initialized!");
            return Err(AMMError::AccountNotInitialized.into());
        };
        let current_price = q6464_sqrt_to_value(sqrt_price_a_by_b);
        let mut delta_a: f64 = 0 as f64;
        let mut delta_b: f64 = 0 as f64;
        if current_price < start_price {
            delta_b = calculate_delta_b(start_price, end_price, liquidity);
        }

        if current_price > end_price {
            delta_a = calculate_delta_b(start_price, end_price, liquidity);
        }

        if current_price > start_price && current_price < end_price {
            delta_a = calculate_delta_b(start_price, current_price, liquidity);

            delta_b = calculate_delta_b(current_price, end_price, liquidity);
        }

        let (position_account_pda, position_account_bump) = Pubkey::find_program_address(
            &[
                nft_mint_account.key.as_array(),
                token_a_mint_account.key.as_array(),
                token_b_mint_account.key.as_array(),
            ],
            amm_program_account.key
        );
        if position_account_pda != *position_account.key {
            msg!("Error: Invalid position account provided.");
            return Err(AMMError::InvalidPositionAccount.into());
        }

        initialize_position_account(
            position_account,
            liquidity_provider_account,
            system_program_account,
            amm_program_account,
            nft_mint_account,
            token_a_mint_account,
            token_b_mint_account,
            position_account_bump,
            start_tick,
            end_tick,
            value_to_sqrt_q6464(liquidity)
        )?;

        initialize_tick_array_accounts(
            first_tick_array_account,
            last_tick_array_account,
            liquidity_provider_account,
            system_program_account,
            amm_program_account,
            amm_token_account,
            start_tick,
            end_tick,
            value_to_sqrt_q6464(liquidity)
        )?;

        //withdrawing token a from provider to pool
        let token_a_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            provider_token_a_account.key,
            amm_token_a_pool_account.key,
            liquidity_provider_account.key,
            &[liquidity_provider_account.key],
            delta_a.ceil() as u64
            // calculated_amount_a
        )?;
        solana_program::program::invoke(
            &token_a_transfer_instruction,
            &[
                spl_token_account.clone(),
                provider_token_a_account.clone(),
                amm_token_a_pool_account.clone(),
                liquidity_provider_account.clone(),
            ]
        )?;

        //withdrawing token b from provider to pool
        let token_b_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            provider_token_b_account.key,
            amm_token_b_pool_account.key,
            liquidity_provider_account.key,
            &[liquidity_provider_account.key],
            delta_b.ceil() as u64
            // calculated_amount_b
        )?;
        solana_program::program::invoke(
            &token_b_transfer_instruction,
            &[
                spl_token_account.clone(),
                provider_token_b_account.clone(),
                amm_token_b_pool_account.clone(),
                liquidity_provider_account.clone(),
            ]
        )?;

        Ok(())
    }

    pub fn withdraw_liquidity(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        minimum_liquidity: u64
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();

        //1. liquidity_provider_account(signer, writable)
        let liquidity_provider_account = next_account_info(accounts_iter)?;

        //2.spl_token_account (readonly)
        let spl_token_account = next_account_info(accounts_iter)?;

        //3. amm_token_account(writable)
        let amm_token_account = next_account_info(accounts_iter)?;

        //4. amm_token_a_pool_account(writable)
        let amm_token_a_pool_account = next_account_info(accounts_iter)?;

        //5. amm_token_b_pool_account(writable)
        let amm_token_b_pool_account = next_account_info(accounts_iter)?;

        //6. provider_token_a_account(writabler)
        let provider_token_a_account = next_account_info(accounts_iter)?;

        //7. provider_token_b_account(writable)
        let provider_token_b_account = next_account_info(accounts_iter)?;
        //8. nft_mint_account(writable)
        let nft_mint_account = next_account_info(accounts_iter)?;

        //9. lp_token_mint_account(writable)
        let lp_token_mint_account = next_account_info(accounts_iter)?;

        //10.sysvar_rent_account (readonly)
        let _sysvar_rent_account = next_account_info(accounts_iter)?;

        //11. token_a_mint_account(read only)
        let token_a_mint_account = next_account_info(accounts_iter)?;

        //12. token_b_mint_account(read only)
        let token_b_mint_account = next_account_info(accounts_iter)?;

        //13. system_program_account(read only)
        let system_program_account = next_account_info(accounts_iter)?;

        //14. amm_program_account (read only)
        let amm_program_account = next_account_info(accounts_iter)?;

        //15. metaplex_core_program_account(read only)
        let metaplex_core_program_account = next_account_info(accounts_iter)?;

        //16. position_account(writable)
        let position_account = next_account_info(accounts_iter)?;

        //17. first_tick_array_account(writable)
        let first_tick_array_account = next_account_info(accounts_iter)?;

        //18. last_tick_array_account(writable)
        let last_tick_array_account = next_account_info(accounts_iter)?;

        //19. start_bitmap_account
        let start_bitmap_account = next_account_info(accounts_iter)?;

        //20. end_bitmap_account
        let end_bitmap_account = next_account_info(accounts_iter)?;

        //validating amm token account
        let (amm_token_account_pda, _amm_token_account_bump) = get_lexicographical_token_pda(
            token_a_mint_account.key,
            token_b_mint_account.key,
            program_id
        );
        if amm_token_account_pda != *amm_token_account.key {
            msg!("Error: Invalid AMM token account provided.");
            return Err(AMMError::InvalidAMMTokenAccount.into());
        }

        //validating token a pool account
        let (token_a_pool_account_pda, token_a_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_a_mint_account.key.as_array()],
            program_id
        );
        if token_a_pool_account_pda != *amm_token_a_pool_account.key {
            msg!("Error: Invalid token A pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }

        //validating token b pool account
        let (token_b_pool_account_pda, token_b_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_b_mint_account.key.as_array()],
            program_id
        );
        if token_b_pool_account_pda != *amm_token_b_pool_account.key {
            msg!("Error: Invalid token B pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }

        // calculating the delta a and delta b based on the withdrawn liquidity
        let mut delta_a = 0 as f64;
        let mut delta_b = 0 as f64;

        let (sqrt_price_a_by_b, current_tick) = match
            AMMAccount::unpack_from_slice(&amm_token_account.data.borrow())?
        {
            AMMAccount::Initialized {
                pool_authority: _,
                token_a_mint: _,
                token_b_mint: _,
                token_a_pool: _,
                token_b_pool: _,
                sqrt_price_a_by_b,
                current_tick,
                active_liquidity: _,
                fee_growth: _,
                protocol_fee: _,
            } => {
                (sqrt_price_a_by_b, current_tick)
            }
            _ => {
                return Err(AMMError::AccountNotInitialized.into());
            }
        };
        let position_account_data = PositionAccount::unpack_from_slice(
            &position_account.data.borrow()
        )?;
        let (start_tick, end_tick, liquidity) = match position_account_data {
            PositionAccount::Initialized { start_tick, end_tick, liquidity } => {
                (start_tick, end_tick, liquidity)
            }
            _ => {
                return Err(AMMError::AccountNotInitialized.into());
            }
        };
        let f64_liquidity = q6464_sqrt_to_value(liquidity);

        //validating the liquidity and if min-0 then withdrawing all
        if f64_liquidity < (minimum_liquidity as f64) {
            return Err(AMMError::InsufficientTokenBalance.into());
        }
        let mut withdraw_amount = minimum_liquidity as f64;
        if minimum_liquidity == 0 {
            withdraw_amount = f64_liquidity;
        }
        let current_price_f64 = q6464_sqrt_to_value(sqrt_price_a_by_b);
        let start_price = tick_index_to_price(start_tick);
        let end_price = tick_index_to_price(end_tick);

        if start_price > current_price_f64 {
            delta_b = calculate_delta_b(start_price, end_price, withdraw_amount);
        } else if end_price < current_price_f64 {
            delta_a = calculate_delta_a(start_price, end_price, withdraw_amount);
        } else {
            delta_a = calculate_delta_a(start_price, current_price_f64, withdraw_amount);
            delta_b = calculate_delta_b(current_price_f64, end_price, withdraw_amount);
        }

        // invoke the spl - transfer to withdraw token a and token b from the pool to provider
        let token_a_decimals = spl_token_interface::state::Mint::unpack_from_slice(
            &token_a_mint_account.data.borrow()
        )?.decimals as f64;
        let token_b_decimals = spl_token_interface::state::Mint::unpack_from_slice(
            &token_b_mint_account.data.borrow()
        )?.decimals as f64;

        //withdrawing token a from pool to provider
        let token_a_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            amm_token_a_pool_account.key,
            provider_token_a_account.key,
            amm_token_a_pool_account.key,
            &[amm_token_a_pool_account.key],
            (delta_a * token_a_decimals).ceil() as u64
        )?;
        solana_program::program::invoke_signed(
            &token_a_transfer_instruction,
            &[
                spl_token_account.clone(),
                amm_token_a_pool_account.clone(),
                provider_token_a_account.clone(),
                amm_token_a_pool_account.clone(),
            ],
            &[
                &[
                    b"pool",
                    amm_token_account_pda.as_array(),
                    token_a_mint_account.key.as_array(),
                    &[token_a_pool_account_bump],
                ],
            ]
        )?;

        //withdrawing token b from pool to provider
        let token_b_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            amm_token_b_pool_account.key,
            provider_token_b_account.key,
            amm_token_b_pool_account.key,
            &[amm_token_b_pool_account.key],
            (delta_b * token_b_decimals).ceil() as u64
        )?;
        solana_program::program::invoke_signed(
            &token_b_transfer_instruction,
            &[
                spl_token_account.clone(),
                amm_token_b_pool_account.clone(),
                provider_token_b_account.clone(),
                amm_token_b_pool_account.clone(),
            ],
            &[
                &[
                    b"pool",
                    amm_token_account_pda.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[token_b_pool_account_bump],
                ],
            ]
        )?;

        // update the ticks with net liquidity
        let mut start_tick_account = TickArray::unpack_from_slice(
            &first_tick_array_account.data.borrow()
        )?;
        let mut end_tick_account = TickArray::unpack_from_slice(
            &last_tick_array_account.data.borrow()
        )?;
        if !start_tick_account.is_initialized() || !end_tick_account.is_initialized() {
            msg!("start_tick_account OR end_tick_account is not initialized!");
            return Err(AMMError::AccountNotInitialized.into());
        }

        let (start_account_ticks, _start_account_start_tick_index, _start_account_array_index) =
            match start_tick_account {
                TickArray::Initialized {
                    ticks: ref mut start_ticks,
                    start_tick_index,
                    array_index,
                } => (start_ticks, start_tick_index, array_index),

                // You MUST handle the case where it is not Initialized
                _ => {
                    return Err(AMMError::AccountNotInitialized.into());
                }
            };
        let (last_account_ticks, _last_account_start_tick_index, _last_account_array_index) = match
            end_tick_account
        {
            TickArray::Initialized { ticks: ref mut last_ticks, start_tick_index, array_index } =>
                (last_ticks, start_tick_index, array_index),

            // You MUST handle the case where it is not Initialized
            _ => {
                return Err(AMMError::AccountNotInitialized.into());
            }
        };

        //INITIALIZE BITMAP ARRAY ACCOUNTS
        let start_bitmap_index = start_tick / 80000;
        let end_bitmap_index = end_tick / 80000;

        //updating ticks
        for tick in start_account_ticks.iter_mut() {
            if tick.tick_index == start_tick {
                tick.net_liquidity -= withdraw_amount.floor() as i64;
                if tick.net_liquidity == 0 {
                    deactivate_bit(&mut start_bitmap_account.data.borrow_mut(), start_tick as u64);
                }
            }
        }
        for tick in last_account_ticks.iter_mut() {
            if tick.tick_index == end_tick {
                tick.net_liquidity += withdraw_amount.floor() as i64;
                if tick.net_liquidity == 0 {
                    activate_bit(&mut end_bitmap_account.data.borrow_mut(), end_tick as u64);
                }
            }
        }
        // saving in onchain account
        start_tick_account.pack_into_slice(&mut first_tick_array_account.data.borrow_mut());
        end_tick_account.pack_into_slice(&mut last_tick_array_account.data.borrow_mut());

        //update the position account and claim the rent exempt if all withdrawn in the signers account
        if minimum_liquidity == 0 {
            let empty_position_instruction = solana_system_interface::instruction::transfer(
                position_account.key,
                liquidity_provider_account.key,
                position_account.lamports()
            );
            let (_position_account_pda, position_account_bump) = Pubkey::find_program_address(
                &[
                    nft_mint_account.key.as_array(),
                    token_a_mint_account.key.as_array(),
                    token_b_mint_account.key.as_array(),
                ],
                amm_program_account.key
            );
            solana_program::program::invoke_signed(
                &empty_position_instruction,
                &[
                    system_program_account.clone(),
                    position_account.clone(),
                    liquidity_provider_account.clone(),
                ],
                &[
                    &[
                        nft_mint_account.key.as_array(),
                        token_a_mint_account.key.as_array(),
                        token_b_mint_account.key.as_array(),
                        &[position_account_bump],
                    ],
                ]
            )?;
        } else {
            let mut position_data = PositionAccount::unpack_from_slice(
                &position_account.data.borrow()
            )?;
            if
                let PositionAccount::Initialized {
                    start_tick: _,
                    end_tick: _,
                    ref mut liquidity,
                } = position_data
            {
                *liquidity -= value_to_sqrt_q6464(withdraw_amount);
            } else {
                return Err(AMMError::AccountNotInitialized.into());
            }
            position_data.pack_into_slice(&mut position_account.data.borrow_mut());
        }

        Ok(())
    }

    pub fn swap_tokens(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        amount_in: u64,
        minimum_amount_out: u64,
        mint_address_in: Pubkey,
        mint_address_out: Pubkey
    ) -> ProgramResult {
        let account_iter = &mut accounts.iter();

        //0. swapper_account(signer, writable)
        let swapper_account = next_account_info(account_iter)?;

        //1. spl_token_account (readonly)
        let spl_token_account = next_account_info(account_iter)?;

        //2. amm_token_account(writable)
        let amm_token_account = next_account_info(account_iter)?;

        //3. amm_token_a_pool_account(writable)
        let amm_token_a_pool_account = next_account_info(account_iter)?;

        //4. amm_token_b_pool_account(writable)
        let amm_token_b_pool_account = next_account_info(account_iter)?;

        //5. swapper_token_a_account(writable)
        let swapper_token_a_account = next_account_info(account_iter)?;

        //6. swapper_token_b_account(writable)
        let swapper_token_b_account = next_account_info(account_iter)?;

        //7. token_a_mint_account(read only)
        let token_a_mint_account = next_account_info(account_iter)?;

        //8. token_b_mint_account(read only)
        let token_b_mint_account = next_account_info(account_iter)?;

        //9. system_program_account(read only)
        let system_program_account = next_account_info(account_iter)?;

        //10. amm_program_account (read only)
        let amm_program_account = next_account_info(account_iter)?;

        //11. bitmap_account_one: (read only)
        let bitmap_account_one = next_account_info(account_iter)?;
        //12. bitmap_account_two: (read only)
        let bitmap_account_two = next_account_info(account_iter)?;

        // //13. tick_array_account_one (read only)
        // let tick_array_account_one = next_account_info(account_iter)?;
        // //14. tick_array_account_two (read only)
        // let tick_array_account_two = next_account_info(account_iter)?;
        // //15. tick_array_account_three (read only)
        // let tick_array_account_three = next_account_info(account_iter)?;
        // //16. tick_array_account_four (read only)
        // let tick_array_account_four = next_account_info(account_iter)?;

        if mint_address_in != *token_a_mint_account.key {
            msg!("base mint address doesn't match the provided account");
            return Err(AMMError::InvalidMintAccount.into());
        }
        if mint_address_out != *token_b_mint_account.key {
            msg!("target mint address doesn't match the provided account");
            return Err(AMMError::InvalidMintAccount.into());
        }
        let (amm_token_account_pda, _amm_token_account_bump) = get_lexicographical_token_pda(
            token_a_mint_account.key,
            token_b_mint_account.key,
            program_id
        );
        if amm_token_account_pda != *amm_token_account.key {
            msg!("Error: Invalid AMM token account provided.");
            return Err(AMMError::InvalidAMMTokenAccount.into());
        }
        //validating token a pool account
        let (token_a_pool_account_pda, _token_a_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_a_mint_account.key.as_array()],
            program_id
        );
        if token_a_pool_account_pda != *amm_token_a_pool_account.key {
            msg!("Error: Invalid token A pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }
        //validating token b pool account
        let (token_b_pool_account_pda, token_b_pool_account_bump) = Pubkey::find_program_address(
            &[b"pool", amm_token_account_pda.as_array(), token_b_mint_account.key.as_array()],
            program_id
        );
        if token_b_pool_account_pda != *amm_token_b_pool_account.key {
            msg!("Error: Invalid token B pool account provided.");
            return Err(AMMError::InvalidPDA.into());
        }
        let token_a_pool_data = spl_token_interface::state::Account::unpack_from_slice(
            &amm_token_a_pool_account.data.borrow()
        )?;

        let token_b_pool_data = spl_token_interface::state::Account::unpack_from_slice(
            &amm_token_b_pool_account.data.borrow()
        )?;
        if token_b_pool_data.amount < minimum_amount_out {
            return Err(AMMError::InsufficientTokenBalance.into());
        }
        // PRICE AND RETURNING TOKEN CALCULATION ---------------------------------------------------------------
        //amm token data
        let mut amm_token_enum = AMMAccount::unpack_from_slice(
            &amm_token_account.data.borrow_mut()
        )?;
        let (
            pool_authority,
            token_a_mint,
            token_b_mint,
            token_a_pool,
            token_b_pool,
            sqrt_price_a_by_b,
            current_tick,
            active_liquidity,
            fee_growth,
            protocol_fee,
        ) = match &mut amm_token_enum {
            AMMAccount::Initialized {
                pool_authority,
                token_a_mint,
                token_b_mint,
                token_a_pool,
                token_b_pool,
                sqrt_price_a_by_b,
                current_tick,
                active_liquidity,
                fee_growth,
                protocol_fee,
            } => {
                (
                    pool_authority,
                    token_a_mint,
                    token_b_mint,
                    token_a_pool,
                    token_b_pool,
                    sqrt_price_a_by_b,
                    current_tick,
                    active_liquidity,
                    fee_growth,
                    protocol_fee,
                )
            }
            _ => {
                return Err(AMMError::AccountNotInitialized.into());
            }
        };

        //bit array one data
        let bitmap_one_enum = Bitmap::unpack_from_slice(&bitmap_account_one.data.borrow())?;
        let bitmap_one = bitmap_one_enum.bitmap;

        let current_price = q6464_sqrt_to_value(*sqrt_price_a_by_b);
        let bitarray_index = get_bitarray_index(*current_tick);

        // if (bitarray_index as u64) != bitmap_index_one {
        //     msg!("Invalid bitmap provided in instruction");
        //     return Err(AMMError::InvalidBitmapArray.into());
        // }
        let tail = get_tail(*current_tick);
        let mut index = tail / 8;
        let mut position = 7 - (tail % 8);

        let mut remaining_token_in = amount_in as f64;
        let mut total_token_out = 0 as f64;

        let mut new_current_tick = *current_tick;
        let mut new_current_price = current_price;
        let mut current_liquidity = q6464_sqrt_to_value(*active_liquidity);
        let mut tick_account = change_bit_array_account(account_iter)?;

        let mut quit = false;
        //iterating through bitmap_one
        if mint_address_out == *token_b_mint && mint_address_in == *token_a_mint {
            for (id, i) in bitmap_one[index as usize..].iter().enumerate() {
                if !quit {
                    for x in 0..8 {
                        if check_bit_status_u8(i, x) == 1 && !quit {
                            //calculate the tick_index and tick_price for the active tick
                            let tick_index = index * 80000 + (id as u32) * 8 + (x as u32);
                            let mut tick_price = tick_index_to_price(tick_index);

                            //calculate the price with remaining tokens with current liquidity
                            let price_with_remaining_in = price_with_a_and_liquidity(
                                remaining_token_in,
                                current_liquidity
                            );

                            //trigger quit if the price_with_remaining_in is less than the tick_price
                            if tick_price > price_with_remaining_in {
                                quit = true;
                                tick_price = price_with_remaining_in;
                            }

                            //calculate deltas with tick_prices and current liquidity
                            let delta_a = calculate_delta_a(
                                new_current_price,
                                tick_price,
                                current_liquidity
                            );
                            let delta_b = calculate_delta_b(
                                new_current_price,
                                tick_price,
                                current_liquidity
                            );

                            remaining_token_in -= delta_a;
                            total_token_out += delta_b;

                            new_current_tick = tick_index;
                            new_current_price = tick_price;

                            if tick_index < tick_account.1 {
                                return Err(AMMError::InvalidTickArray.into());
                            }
                            loop {
                                if tick_index > tick_account.1 {
                                    tick_account = change_bit_array_account(account_iter)?;
                                    break;
                                }
                            }
                            let array_index_for_tick = tick_index / TICK_ARRAY_SIZE;
                            let tick_trail = tick_index % TICK_ARRAY_SIZE;

                            if array_index_for_tick != tick_account.2 {
                                msg!("tick array not found!");
                                return Err(AMMError::InvalidTickArray.into());
                            }
                            let net_liquidity = tick_account.0[tick_trail as usize].net_liquidity;
                            if net_liquidity < 0 {
                                current_liquidity -= net_liquidity.abs() as f64;
                            } else {
                                current_liquidity += net_liquidity.abs() as f64;
                            }

                            // update the remaining amount to be calculated
                        }
                    }
                }
            }
        } else if mint_address_out == *token_a_mint && mint_address_in == *token_b_mint {
            for (id, i) in bitmap_one[..index as usize].iter().rev().enumerate() {
                for x in (0..8).rev() {
                    if check_bit_status_u8(i, x) == 1 && !quit {
                        //calculate the tick_index and tick_price for the active tick
                        let tick_index = index * 80000 + (id as u32) * 8 + (x as u32);
                        let mut tick_price = tick_index_to_price(tick_index);

                        //calculate the price with remaining tokens with current liquidity
                        let price_with_remaining_in = price_with_b_and_liquidity(
                            remaining_token_in,
                            current_liquidity
                        );

                        //trigger quit if the price_with_remaining_in is less than the tick_price
                        if tick_price > price_with_remaining_in {
                            quit = true;
                            tick_price = price_with_remaining_in;
                        }

                        //calculate deltas with tick_prices and current liquidity
                        let delta_a = calculate_delta_a(
                            tick_price,
                            new_current_price,
                            current_liquidity
                        );
                        let delta_b = calculate_delta_b(
                            tick_price,
                            new_current_price,
                            current_liquidity
                        );

                        remaining_token_in -= delta_b;
                        total_token_out += delta_a;

                        new_current_tick = tick_index;
                        new_current_price = tick_price;

                        if tick_index > tick_account.1 + 88 {
                            return Err(AMMError::InvalidTickArray.into());
                        }
                        loop {
                            if tick_index < tick_account.1 {
                                tick_account = change_bit_array_account(account_iter)?;
                                break;
                            }
                        }
                        let array_index_for_tick = tick_index / TICK_ARRAY_SIZE;
                        let tick_trail = tick_index % TICK_ARRAY_SIZE;

                        if array_index_for_tick != tick_account.2 {
                            msg!("tick array not found!");
                            return Err(AMMError::InvalidTickArray.into());
                        }
                        let net_liquidity = tick_account.0[tick_trail as usize].net_liquidity;
                        if net_liquidity < 0 {
                            current_liquidity -= net_liquidity.abs() as f64;
                        } else {
                            current_liquidity += net_liquidity.abs() as f64;
                        }
                        // update the remaining amount to be calculated
                    }
                }
            }
        }

        *active_liquidity = value_to_sqrt_q6464(current_liquidity);
        *sqrt_price_a_by_b = value_to_sqrt_q6464(new_current_price);

        amm_token_enum.pack_into_slice(&mut amm_token_account.data.borrow_mut());

        //moving tokens from swapper to token pool
        let token_a_admin_to_pool_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            swapper_token_a_account.key,
            amm_token_a_pool_account.key,
            swapper_account.key,
            &[swapper_account.key],
            ((amount_in as f64) - remaining_token_in).ceil() as u64
        )?;
        msg!("swapper to pool");
        solana_program::program::invoke(
            &token_a_admin_to_pool_transfer_instruction,
            &[
                spl_token_account.clone(),
                swapper_token_a_account.clone(),
                amm_token_a_pool_account.clone(),
                swapper_account.clone(),
            ]
        )?;
        let token_b_transfer_instruction = spl_token_interface::instruction::transfer(
            spl_token_account.key,
            amm_token_b_pool_account.key,
            swapper_token_b_account.key,
            amm_token_b_pool_account.key,
            &[amm_token_b_pool_account.key],
            total_token_out.ceil() as u64
        )?;
        msg!("pool to swapper");
        solana_program::program::invoke_signed(
            &token_b_transfer_instruction,
            &[
                spl_token_account.clone(),
                amm_token_b_pool_account.clone(),
                swapper_token_b_account.clone(),
                amm_token_b_pool_account.clone(),
            ],
            &[
                &[
                    b"pool",
                    amm_token_account_pda.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[token_b_pool_account_bump],
                ],
            ]
        )?;
        Ok(())
    }
}

pub fn initialize_amm_pool_account<'a>(
    admin_account: &AccountInfo<'a>,
    program_id: &Pubkey,
    amm_token_account: &AccountInfo<'a>,
    amm_token_account_bump: u8,
    system_program_account: &AccountInfo<'a>,
    _spl_token_program_account: &AccountInfo<'a>,
    token_a_mint_account: &Pubkey,
    token_b_mint_account: &Pubkey,
    token_a_pool_account: &Pubkey,
    token_b_pool_account: &Pubkey
) -> ProgramResult {
    //creating amm pool account if not already created
    if amm_token_account.data.borrow().len() == 0 {
        let lp_token_mint_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                amm_token_account.key,
                Rent::get()?.minimum_balance(AMMAccount::LEN),
                AMMAccount::LEN as u64,
                amm_token_account.key
            );
        solana_program::program::invoke_signed(
            &lp_token_mint_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), amm_token_account.clone()],
            &[
                &[
                    token_a_mint_account.as_array(),
                    token_b_mint_account.as_array(),
                    &[amm_token_account_bump],
                ],
            ]
        )?;
    }

    //initializing lp token mint account data
    let lp_token_mint_account_data = AMMAccount::Initialized {
        pool_authority: *program_id,
        token_a_mint: *token_a_mint_account,
        token_b_mint: *token_b_mint_account,
        token_a_pool: *token_a_pool_account,
        token_b_pool: *token_b_pool_account,
        sqrt_price_a_by_b: 0,
        current_tick: 0,
        active_liquidity: 0,
        fee_growth: 0,
        protocol_fee: 0,
    };

    lp_token_mint_account_data.pack_into_slice(&mut amm_token_account.data.borrow_mut());

    Ok(())
}

pub fn initialize_lp_token_mint_account<'a>(
    admin_account: &AccountInfo<'a>,
    _program_id: &Pubkey,
    amm_token_account_pda: &Pubkey,
    lp_token_mint_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    spl_token_program_account: &AccountInfo<'a>,
    lp_token_mint_account_bump: u8,
    token_a_mint_account: &AccountInfo<'a>,
    token_b_mint_account: &AccountInfo<'a>,
    sysvar_rent_account: &AccountInfo<'a>
) -> ProgramResult {
    if lp_token_mint_account.data.borrow().len() == 0 {
        let lp_token_mint_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                lp_token_mint_account.key,
                Rent::get()?.minimum_balance(spl_token_interface::state::Mint::LEN),
                spl_token_interface::state::Mint::LEN as u64,
                spl_token_program_account.key
            );

        solana_program::program::invoke_signed(
            &lp_token_mint_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), lp_token_mint_account.clone()],
            &[
                &[
                    b"mint",
                    amm_token_account_pda.as_array(),
                    token_a_mint_account.key.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[lp_token_mint_account_bump],
                ],
            ]
        )?;
    }

    let lp_token_mint_instruction = spl_token_interface::instruction::initialize_mint(
        spl_token_program_account.key,
        lp_token_mint_account.key,
        lp_token_mint_account.key,
        Some(lp_token_mint_account.key),
        0
    )?;

    let _ = solana_program::program::invoke_signed(
        &lp_token_mint_instruction,
        &[
            spl_token_program_account.clone(),
            lp_token_mint_account.clone(),
            sysvar_rent_account.clone(),
        ],
        &[
            &[
                b"mint",
                amm_token_account_pda.as_array(),
                token_a_mint_account.key.as_array(),
                token_b_mint_account.key.as_array(),
                &[lp_token_mint_account_bump],
            ],
        ]
    )?;
    Ok(())
}

pub fn initialize_token_pool_accounts<'a>(
    admin_account: &AccountInfo<'a>,
    _program_id: &Pubkey,
    amm_token_account_pda: &Pubkey,
    system_program_account: &AccountInfo<'a>,
    spl_token_program_account: &AccountInfo<'a>,
    token_a_mint_account: &AccountInfo<'a>,
    token_b_mint_account: &AccountInfo<'a>,
    token_a_pool_account: &AccountInfo<'a>,
    token_b_pool_account: &AccountInfo<'a>,
    token_a_pool_account_bump: u8,
    token_b_pool_account_bump: u8,
    _amm_token_account: &AccountInfo<'a>,
    sysvar_rent_account: &AccountInfo<'a>,
    amm_program_account: &AccountInfo<'a>
) -> ProgramResult {
    if token_a_pool_account.data.borrow().len() == 0 {
        let token_a_pool_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                token_a_pool_account.key,
                Rent::get()?.minimum_balance(spl_token_interface::state::Account::LEN),
                spl_token_interface::state::Account::LEN as u64,
                spl_token_program_account.key
            );

        solana_program::program::invoke_signed(
            &token_a_pool_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), token_a_pool_account.clone()],
            &[
                &[
                    b"pool",
                    amm_token_account_pda.as_array(),
                    token_a_mint_account.key.as_array(),
                    &[token_a_pool_account_bump],
                ],
            ]
        )?;
    }
    if token_b_pool_account.data.borrow().len() == 0 {
        let token_b_pool_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                token_b_pool_account.key,
                Rent::get()?.minimum_balance(spl_token_interface::state::Account::LEN),
                spl_token_interface::state::Account::LEN as u64,
                spl_token_program_account.key
            );

        solana_program::program::invoke_signed(
            &token_b_pool_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), token_b_pool_account.clone()],
            &[
                &[
                    b"pool",
                    amm_token_account_pda.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[token_b_pool_account_bump],
                ],
            ]
        )?;
    }

    let token_a_pool_account_initialize_instruction =
        spl_token_interface::instruction::initialize_account(
            spl_token_program_account.key,
            token_a_pool_account.key,
            token_a_mint_account.key,
            token_a_pool_account.key
        )?;

    let _ = solana_program::program::invoke_signed(
        &token_a_pool_account_initialize_instruction,
        &[
            spl_token_program_account.clone(),
            token_a_pool_account.clone(),
            token_a_mint_account.clone(),
            amm_program_account.clone(),
            sysvar_rent_account.clone(),
        ],
        &[
            &[
                b"pool",
                amm_token_account_pda.as_array(),
                token_a_mint_account.key.as_array(),
                &[token_a_pool_account_bump],
            ],
        ]
    );

    let token_b_pool_account_initialize_instruction =
        spl_token_interface::instruction::initialize_account(
            spl_token_program_account.key,
            token_b_pool_account.key,
            token_b_mint_account.key,
            token_b_pool_account.key
        )?;

    let _ = solana_program::program::invoke_signed(
        &token_b_pool_account_initialize_instruction,
        &[
            spl_token_program_account.clone(),
            token_b_pool_account.clone(),
            token_b_mint_account.clone(),
            amm_program_account.clone(),
            sysvar_rent_account.clone(),
        ],
        &[
            &[
                b"pool",
                amm_token_account_pda.as_array(),
                token_b_mint_account.key.as_array(),
                &[token_b_pool_account_bump],
            ],
        ]
    );
    Ok(())
}

pub fn initialize_admin_lp_token_account<'a>(
    admin_account: &AccountInfo<'a>,
    _program_id: &Pubkey,
    amm_token_account_pda: &Pubkey,
    admin_lp_token_account: &AccountInfo<'a>,
    spl_token_program_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    lp_token_mint_account: &AccountInfo<'a>,
    token_a_mint_account: &AccountInfo<'a>,
    token_b_mint_account: &AccountInfo<'a>,
    admin_lp_token_account_bump: u8,
    sysvar_rent_account: &AccountInfo<'a>,
    amm_program_account: &AccountInfo<'a>
) -> ProgramResult {
    if admin_lp_token_account.data.borrow().len() == 0 {
        let admin_lp_token_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                admin_lp_token_account.key,
                Rent::get()?.minimum_balance(spl_token_interface::state::Account::LEN),
                spl_token_interface::state::Account::LEN as u64,
                spl_token_program_account.key
            );

        solana_program::program::invoke_signed(
            &admin_lp_token_account_create_instruction,
            &[
                system_program_account.clone(),
                admin_account.clone(),
                admin_lp_token_account.clone(),
            ],
            &[
                &[
                    admin_account.key.as_array(),
                    amm_token_account_pda.as_array(),
                    token_a_mint_account.key.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[admin_lp_token_account_bump],
                ],
            ]
        )?;
    }
    let spl_state = spl_token_interface::state::Account::unpack_from_slice(
        &admin_lp_token_account.data.borrow()
    )?;
    if !spl_state.is_initialized() {
        let admin_lp_token_account_initialize_instruction =
            spl_token_interface::instruction::initialize_account(
                spl_token_program_account.key,
                admin_lp_token_account.key,
                lp_token_mint_account.key,
                admin_account.key
            )?;

        solana_program::program::invoke_signed(
            &admin_lp_token_account_initialize_instruction,
            &[
                spl_token_program_account.clone(),
                admin_lp_token_account.clone(),
                lp_token_mint_account.clone(),
                amm_program_account.clone(),
                sysvar_rent_account.clone(),
            ],
            &[
                &[
                    admin_account.key.as_array(),
                    amm_token_account_pda.as_array(),
                    token_a_mint_account.key.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[admin_lp_token_account_bump],
                ],
            ]
        )?;
    }
    Ok(())
}

pub fn get_lexicographical_token_pda(a: &Pubkey, b: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    if *a.to_string() > *b.to_string() {
        Pubkey::find_program_address(&[b.as_array(), a.as_array()], program_id)
    } else {
        Pubkey::find_program_address(&[a.as_array(), b.as_array()], program_id)
    }
}

pub fn get_lexicographical_mint_pda(
    str: &[u8],
    amm_token_account: &Pubkey,
    a: &Pubkey,
    b: &Pubkey,
    program_id: &Pubkey
) -> (Pubkey, u8) {
    if *a.to_string() > *b.to_string() {
        Pubkey::find_program_address(
            &[str, amm_token_account.as_array(), b.as_array(), a.as_array()],
            program_id
        )
    } else {
        Pubkey::find_program_address(
            &[str, amm_token_account.as_array(), a.as_array(), b.as_array()],
            program_id
        )
    }
}

pub fn get_lexicographical_lp_token_pda(
    owner_address: &Pubkey,
    amm_token_account: &Pubkey,
    a: &Pubkey,
    b: &Pubkey,
    program_id: &Pubkey
) -> (Pubkey, u8) {
    if *a.to_string() > *b.to_string() {
        Pubkey::find_program_address(
            &[owner_address.as_array(), amm_token_account.as_array(), b.as_array(), a.as_array()],
            program_id
        )
    } else {
        Pubkey::find_program_address(
            &[owner_address.as_array(), amm_token_account.as_array(), a.as_array(), b.as_array()],
            program_id
        )
    }
}

pub fn get_lexicographical_tokens_addresses<'a>(
    x: &'a Pubkey,
    y: &'a Pubkey,
    seeds: &'a mut Vec<&'a [u8]>
) -> &'a mut Vec<&'a [u8]> {
    if *x.to_string() > *y.to_string() {
        seeds.push(y.as_array());
        seeds.push(x.as_array());
    } else {
        seeds.push(x.as_array());
        seeds.push(y.as_array());
    }
    seeds
}
pub struct CreateV2 {
    /// The address of the new asset
    pub asset: solana_program::pubkey::Pubkey,
    /// The collection to which the asset belongs
    pub collection: solana_program::pubkey::Pubkey,
    /// The authority signing for creation
    pub authority: solana_program::pubkey::Pubkey,
    /// The account paying for the storage fees
    pub payer: solana_program::pubkey::Pubkey,
    /// The owner of the new asset. Defaults to the authority if not present.
    pub owner: solana_program::pubkey::Pubkey,
    /// The authority on the new asset
    pub update_authority: solana_program::pubkey::Pubkey,
    /// The system program
    pub system_program: solana_program::pubkey::Pubkey,
    /// The SPL Noop Program
    pub log_wrapper: solana_program::pubkey::Pubkey,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum DataState {
    AccountState,
    LedgerState,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct CreateV2InstructionArgs {
    pub data_state: DataState,
    pub name: String,
    pub uri: String,
    pub plugins: Option<String>,
    pub external_plugin_adapters: Option<String>,
}
pub fn initialize_nft_accounts<'a>(
    nft_mint_account: &AccountInfo<'a>,
    admin_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    metaplex_core_program_account: &AccountInfo<'a>
) -> ProgramResult {
    let accounts: Vec<AccountMeta> = vec![
        //      /// The address of the new asset
        // pub asset: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: *nft_mint_account.key,
            is_signer: true,
            is_writable: true,
        },
        // /// The collection to which the asset belongs (optional)
        // pub collection: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: solana_address::Address::from_str_const(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            ),
            is_signer: false,
            is_writable: false,
        },
        // /// The authority signing for creation (optional)
        // pub authority: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: solana_address::Address::from_str_const(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            ),
            is_signer: false,
            is_writable: false,
        },
        // /// The account paying for the storage fees
        // pub payer: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: *admin_account.key,
            is_signer: true,
            is_writable: true,
        },
        // /// The owner of the new asset. Defaults to the authority if not present. (optional)
        // pub owner: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: solana_address::Address::from_str_const(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            ),
            is_signer: false,
            is_writable: false,
        },
        // /// The authority on the new asset (optional)
        // pub update_authority: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: solana_address::Address::from_str_const(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            ),
            is_signer: false,
            is_writable: false,
        },
        // /// The system program
        // pub system_program: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: *system_program_account.key,
            is_signer: false,
            is_writable: false,
        },
        // /// The SPL Noop Program (optional)
        // pub log_wrapper: solana_program::pubkey::Pubkey,

        AccountMeta {
            pubkey: solana_address::Address::from_str_const(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            ),
            is_signer: false,
            is_writable: false,
        }
    ];

    let data = CreateV2InstructionArgs {
        data_state: DataState::AccountState,
        name: "clmm_liquidity_account".to_string(),
        uri: "".to_string(),
        plugins: None,
        external_plugin_adapters: None,
    };
    let mut serialized_data = vec![];
    data.serialize(&mut serialized_data).expect("cannot serialize metaplex data!");

    let instruction = solana_program::instruction::Instruction {
        program_id: solana_address::Address::from_str_const(
            "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        ),
        accounts: accounts,
        data: serialized_data,
    };

    invoke(
        &instruction,
        &[
            nft_mint_account.clone(),
            metaplex_core_program_account.clone(),
            metaplex_core_program_account.clone(),
            admin_account.clone(),
            metaplex_core_program_account.clone(),
            metaplex_core_program_account.clone(),
            system_program_account.clone(),
            metaplex_core_program_account.clone(),
        ]
    )?;
    Ok(())
}

pub fn initialize_position_account<'a>(
    position_account: &AccountInfo<'a>,
    admin_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    amm_program_account: &AccountInfo<'a>,
    nft_mint_account: &AccountInfo<'a>,
    token_a_mint_account: &AccountInfo<'a>,
    token_b_mint_account: &AccountInfo<'a>,
    position_account_bump: u8,
    start_tick: u32,
    end_tick: u32,
    liquidity: u128
) -> ProgramResult {
    if position_account.data.borrow().len() == 0 {
        let admin_lp_token_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                position_account.key,
                Rent::get()?.minimum_balance(PositionAccount::LEN),
                PositionAccount::LEN as u64,
                amm_program_account.key
            );

        solana_program::program::invoke_signed(
            &admin_lp_token_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), position_account.clone()],
            &[
                &[
                    nft_mint_account.key.as_array(),
                    token_a_mint_account.key.as_array(),
                    token_b_mint_account.key.as_array(),
                    &[position_account_bump],
                ],
            ]
        )?;
    }
    let position_account_data = PositionAccount::try_from_slice(
        position_account.data.borrow().as_ref()
    )?;
    match position_account_data {
        PositionAccount::Uninitialized => {
            let position_account_initialize_data = PositionAccount::Initialized {
                start_tick,
                end_tick,
                liquidity,
            };
            position_account_initialize_data.pack_into_slice(
                &mut position_account.data.borrow_mut()
            );
        }
        PositionAccount::Initialized { .. } => {
            msg!("Position account already initialized");
            return Err(AMMError::AccountAlreadyInitialized.into());
        }
    }
    Ok(())
}

pub fn initialize_tick_array_accounts<'a>(
    first_tick_array_account: &AccountInfo<'a>,
    last_tick_array_account: &AccountInfo<'a>,
    admin_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    amm_program_account: &AccountInfo<'a>,
    amm_token_account: &AccountInfo<'a>,
    start_tick: u32,
    last_tick: u32,
    active_liquidity: u128
) -> ProgramResult {
    let start_tick_array_index = start_tick / (TICK_ARRAY_SIZE as u32);
    let last_tick_array_index = last_tick / (TICK_ARRAY_SIZE as u32);

    let (first_tick_array_pda, first_tick_array_bump) = Pubkey::find_program_address(
        &[&start_tick_array_index.to_be_bytes(), amm_token_account.key.as_array()],
        amm_program_account.key
    );
    let (last_tick_array_pda, last_tick_array_bump) = Pubkey::find_program_address(
        &[&last_tick_array_index.to_be_bytes(), amm_token_account.key.as_array()],
        amm_program_account.key
    );

    //validating first tick array account
    if first_tick_array_pda != *first_tick_array_account.key {
        msg!("Error: Invalid first tick array account provided.");
        return Err(AMMError::InvalidPDA.into());
    }
    //validating last tick array account
    if last_tick_array_pda != *last_tick_array_account.key {
        msg!("Error: Invalid last tick array account provided.");
        return Err(AMMError::InvalidPDA.into());
    }

    //initialize first tick array account
    if first_tick_array_account.data.borrow().len() == 0 {
        let first_tick_array_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                first_tick_array_account.key,
                Rent::get()?.minimum_balance(TickArray::LEN),
                TickArray::LEN as u64,
                amm_program_account.key
            );
        solana_program::program::invoke_signed(
            &first_tick_array_account_create_instruction,
            &[
                system_program_account.clone(),
                admin_account.clone(),
                first_tick_array_account.clone(),
            ],
            &[
                &[
                    &start_tick_array_index.to_be_bytes(),
                    amm_token_account.key.as_array(),
                    &[first_tick_array_bump],
                ],
            ]
        )?;
    }
    //initialize last tick array account
    if
        last_tick_array_account.data.borrow().len() == 0 &&
        start_tick_array_index != last_tick_array_index
    {
        let last_tick_array_account_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                last_tick_array_account.key,
                Rent::get()?.minimum_balance(TickArray::LEN),
                TickArray::LEN as u64,
                amm_program_account.key
            );
        solana_program::program::invoke_signed(
            &last_tick_array_account_account_create_instruction,
            &[
                system_program_account.clone(),
                admin_account.clone(),
                last_tick_array_account.clone(),
            ],
            &[
                &[
                    &last_tick_array_index.to_be_bytes(),
                    amm_token_account.key.as_array(),
                    &[last_tick_array_bump],
                ],
            ]
        )?;
    }
    if start_tick_array_index == last_tick_array_index {
        let tick_array_data = TickArray::Initialized {
            ticks: vec![
                TickState {
                    net_liquidity: active_liquidity as i64,
                    tick_index: start_tick,
                },
                TickState {
                    net_liquidity: (active_liquidity as i64) * -1,
                    tick_index: last_tick,
                }
            ],
            start_tick_index: start_tick_array_index * (TICK_ARRAY_SIZE as u32),
            array_index: start_tick_array_index,
        };
        tick_array_data.pack_into_slice(&mut first_tick_array_account.data.borrow_mut());
        return Ok(());
    }

    let first_tick_array_data = TickArray::Initialized {
        ticks: vec![TickState {
            net_liquidity: active_liquidity as i64,
            tick_index: start_tick,
        }],
        start_tick_index: start_tick_array_index * (TICK_ARRAY_SIZE as u32),
        array_index: start_tick_array_index,
    };
    first_tick_array_data.pack_into_slice(&mut first_tick_array_account.data.borrow_mut());

    let last_tick_array_data = TickArray::Initialized {
        ticks: vec![TickState {
            net_liquidity: (active_liquidity as i64) * -1,
            tick_index: last_tick,
        }],
        start_tick_index: last_tick_array_index * (TICK_ARRAY_SIZE as u32),
        array_index: last_tick_array_index,
    };
    last_tick_array_data.pack_into_slice(&mut last_tick_array_account.data.borrow_mut());

    Ok(())
}

pub fn initialize_bitmap_account<'a>(
    bitmap_account: &AccountInfo<'a>,
    bitmap_account_bump: u8,
    admin_account: &AccountInfo<'a>,
    system_program_account: &AccountInfo<'a>,
    amm_program_account: &AccountInfo<'a>,
    amm_token_account_pda: &Pubkey,
    bitmap_index: u32,
    program_id: &Pubkey
) -> ProgramResult {
    if bitmap_account.data.borrow().len() == 0 {
        let admin_lp_token_account_create_instruction =
            solana_system_interface::instruction::create_account(
                admin_account.key,
                bitmap_account.key,
                Rent::get()?.minimum_balance(Bitmap::LEN),
                Bitmap::LEN as u64,
                amm_program_account.key
            );
        // let index_bytes = bitmap_index.to_be_bytes(); // Try LE if BE fails
        msg!(
            "{:?}, {:?}, {:?}, {:?}",
            bitmap_index.to_be_bytes(),
            bitmap_account_bump,
            bitmap_account.key,
            amm_token_account_pda
        );
        msg!("Current program id: {:?}", program_id);
msg!("AMM program account key: {:?}", amm_program_account.key);
        // let pda_bytes = amm_token_account_pda.as_ref();
        // let bump_slice = [bitmap_account_bump];
        solana_program::program::invoke_signed(
            &admin_lp_token_account_create_instruction,
            &[system_program_account.clone(), admin_account.clone(), bitmap_account.clone()],
            &[
                &[
                    b"bitmap",
                    &bitmap_index.to_be_bytes(),
                    amm_token_account_pda.as_ref(),
                    &[bitmap_account_bump],
                ],
            ]
        )?;
    }

    // let bitmap = Bitmap::Initialized {
    //     bitmap: vec![0 as u8]
    //         .try_into()
    //         .expect("Too large bitmap array!"),
    //     index: bitmap_index as u64,
    // };

    // bitmap.pack_into_slice(&mut bitmap_account.data.borrow_mut());

    Ok(())
}

pub fn change_bit_array_account(
    account_iter: &mut Iter<'_, AccountInfo<'_>>
) -> core::result::Result<(Vec<TickState>, u32, u32), ProgramError> {
    let tick_array_one_enum = TickArray::unpack_from_slice(
        &next_account_info(account_iter)?.data.borrow()
    )?;

    match tick_array_one_enum {
        TickArray::Initialized { ticks, start_tick_index, array_index } => {
            return Ok((ticks, start_tick_index, array_index));
        }
        TickArray::Uninitialized => {
            return Err(AMMError::AccountNotInitialized.into());
        }
    }
}

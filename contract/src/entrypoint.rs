use solana_program::{
    entrypoint,
    account_info::{ AccountInfo },
    entrypoint::{ ProgramResult },
    pubkey::Pubkey,
};
// amm program id:DzJJz3MQJeqgfGePLndCFG64M8zKJAKaWHYgTzXfuPnZ

// admin:GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3
// (solana-keygen new --force)

// token a mint:6pXNd5iDL3kqz8MxGiqZu4hb9vB9KbrPknGJ5vXfkMgd
// (spl-token create-token)

// token b mint:DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP
// (spl-token create-token)

// token a admin: cfqVCaPpWougv7Kq8kamHk3oZRNYhrTK6QURcACe1xt
// (spl-token create-account token-a-mint, spl-token mint mint-a 1000 token-a-admin)

// token b admin: ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn
// (spl-token create-account token-b-mint, spl-token mint mint-b 10 token-b-admin)

//spl token: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA

use crate::{ instruction::AMMInstruction, processor::Processor };

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    match AMMInstruction::unpack(instruction_data)? {
        AMMInstruction::InitializeTokenPool {
            token_a_amount,
            token_b_amount,
            start_tick,
            end_tick,
        } => {
            Processor::initialize_token_pool_account(
                program_id,
                accounts,
                token_a_amount,
            token_b_amount,
            start_tick,
            end_tick
            )
        }
        AMMInstruction::AddLiquidity { liquidity, start_tick, end_tick } => {
            Processor::add_liquidity(
                program_id,
                accounts,
                liquidity,
                start_tick,
                end_tick
            )
        }
        AMMInstruction::WithdrawLiquidity { minimum_liquidity } => {
            Processor::withdraw_liquidity(
                program_id,
                accounts,
                minimum_liquidity
            )
        }
        AMMInstruction::Swap {
            amount_in,
            minimum_amount_out,
            mint_address_in,
            mint_address_out,
        } => {
            Processor::swap_tokens(
                program_id,
                accounts,
                amount_in,
                minimum_amount_out,
                mint_address_in,
                mint_address_out
            )
        }
        _ => { Ok(()) }
    }
}

use anyhow::anyhow;
use solana_address::Address;
use solana_message::compiled_instruction::CompiledInstruction;

use crate::{db_helper::get_pg, rpc_helper::get_rpc, transaction_handler::handle_accounts::{handle_create_token_account, handle_update_token_account}};

pub async fn handle_initialize_token_pool(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    token_a_amount: u64,
    token_b_amount: u64,
    start_tick: u32,
    end_tick: u32
) -> anyhow::Result<()> {
    let pg = get_pg().await;
    let rpc = get_rpc().clone();
    let mut pubkeys: Vec<Address> = vec![];

    for i in accounts{
        pubkeys.push(account_keys[i as usize]);
    };
    let account_details = rpc.get_multiple_accounts(&pubkeys).await?;

    let token_account = account_details[11].clone().ok_or(anyhow!("Token account data missing!"))?;

    let _ = handle_create_token_account(token_account, pg).await;

    println!("handling initialize pool instruction");
    Ok(())
}

pub async fn handle_add_liquidity(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    liquidity: f64,
    start_tick: u32,
    end_tick: u32
) -> anyhow::Result<()> {
    println!("handling add liquidity instruction");
    Ok(())
}

pub async fn handle_withdraw_liquidity(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    minimum_liquidity: u64
) -> anyhow::Result<()> {
    println!("handling withdraw liquidity instruction!");
    Ok(())
}

pub async fn handle_swap(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    amount_in: u64,
    minimum_amount_out: u64,
    mint_address_in: Address,
    mint_address_out: Address
) -> anyhow::Result<()> {
    println!("handling swap instruction!");
    Ok(())
}

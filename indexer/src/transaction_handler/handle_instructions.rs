use anyhow::anyhow;
use solana_account::Account;
use solana_address::Address;
use solana_client::rpc_config::{ CommitmentConfig, RpcAccountInfoConfig, UiAccountEncoding };
use solana_message::compiled_instruction::CompiledInstruction;

use crate::{
    db_helper::get_pg,
    rpc_helper::get_rpc,
    transaction_handler::handle_accounts::{
        DbPositionAccount, create_token_pool_account, create_user_token_account, delete_position_account, get_position_account, handle_create_active_tick, handle_create_position_account, handle_create_token_account, handle_update_or_delete_position_account, handle_update_token_account, update_market_token_account
    },
};

pub async fn handle_initialize_token_pool(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    token_a_amount: u64,
    token_b_amount: u64,
    start_tick: u32,
    end_tick: u32,
    slot: u64
) -> anyhow::Result<()> {
    let rpc = get_rpc().clone();
    let mut pubkeys: Vec<Address> = vec![];

    for i in accounts {
        pubkeys.push(account_keys[i as usize]);
    }

    // all the account details used in the create token instruction
    let account_details: solana_client::rpc_response::Response<Vec<Option<solana_client::rpc_response::UiAccount>>> = rpc.get_multiple_ui_accounts_with_config(&pubkeys, RpcAccountInfoConfig {
        encoding: Some(UiAccountEncoding::Base64),
        commitment: Some(CommitmentConfig::confirmed()),
        data_slice: None,
        // setting the slot to current slot + 1 to ensure that the validator is synced with chain
        min_context_slot: Some(slot),
    }).await?;

    // println!("pub keys: {:?},\naccount details {:?}", pubkeys, account_details);
    // let admin_address:Account = account_details.value[0].clone().ok_or(anyhow!("admin account not found"))?.decode().ok_or(anyhow!("cannot decode admin account"))?;

    //handling the token account data
    let token_account = account_details.value[9]
        .clone()
        .ok_or(anyhow!("Token account data missing!"))?;
    println!("token_account: {:?}", token_account);

    let decoded_token_account_data = token_account.decode().ok_or(anyhow!("unable to decode"))?;

    let result = handle_create_token_account(decoded_token_account_data, pubkeys[9]).await?;

    //handling token pool accounts
    let token_a_pool_account = account_details.value[7]
        .clone()
        .ok_or(anyhow!("Token a pool account missing!"))?;
    let decoded_token_a_pool_account = token_a_pool_account
        .decode()
        .ok_or(anyhow!("cannot decode token a pool account"))?;

    let token_b_pool_account = account_details.value[8]
        .clone()
        .ok_or(anyhow!("Token b pool account missing!"))?;
    let decoded_token_b_pool_account = token_b_pool_account
        .decode()
        .ok_or(anyhow!("cannot decode token a pool account"))?;

    let result = create_token_pool_account(
        decoded_token_a_pool_account,
        decoded_token_b_pool_account
    ).await?;

    //handling position account
    let position_account: Account = account_details.value[14]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = handle_create_position_account(
        position_account,
        pubkeys[0],
        pubkeys[1],
        pubkeys[14]
    ).await?;

    //handling user token addressses
    let user_token_a_account: Account = account_details.value[5]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let user_token_b_account: Account = account_details.value[6]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = create_user_token_account(user_token_a_account,pubkeys[5], pubkeys[0]).await?;
    let _ = create_user_token_account(user_token_b_account,pubkeys[6], pubkeys[0]).await?;

    //handling active ticks
    // println!("handling initialize pool instruction result: {:?}", position_result);

    let tick_array_account_one: Account = account_details.value[15]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let tick_array_account_two: Account = account_details.value[16]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = handle_create_active_tick(tick_array_account_one, start_tick, pubkeys[9]);
    let _ = handle_create_active_tick(tick_array_account_two, end_tick,pubkeys[9]);
    
    Ok(())
}

pub async fn handle_add_liquidity(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    liquidity: f64,
    start_tick: u32,
    end_tick: u32,
    slot: u64
) -> anyhow::Result<()> {
    let rpc = get_rpc().clone();
    let mut pubkeys: Vec<Address> = vec![];

    for i in accounts {
        pubkeys.push(account_keys[i as usize]);
    }

    // all the account details used in the create token instruction
    let account_details: solana_client::rpc_response::Response<Vec<Option<solana_client::rpc_response::UiAccount>>> = rpc.get_multiple_ui_accounts_with_config(&pubkeys, RpcAccountInfoConfig {
        encoding: Some(UiAccountEncoding::Base64),
        commitment: Some(CommitmentConfig::confirmed()),
        data_slice: None,
        // setting the slot to current slot + 1 to ensure that the validator is synced with chain
        min_context_slot: Some(slot),
    }).await?;

    //handling position account
    let position_account: Account = account_details.value[13]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = handle_create_position_account(
        position_account,
        pubkeys[0],
        pubkeys[1],
        pubkeys[13]
    ).await?;

    //handling tick array accounts
    let tick_array_account_one: Account = account_details.value[14]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let tick_array_account_two: Account = account_details.value[15]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = handle_create_active_tick(tick_array_account_one, start_tick, pubkeys[2]).await?;
    let _ = handle_create_active_tick(tick_array_account_two, end_tick,pubkeys[2]).await?;

    //handling user token accounts
    let user_token_a_account: Account = account_details.value[5]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let user_token_b_account: Account = account_details.value[6]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = create_user_token_account(user_token_a_account,pubkeys[5], pubkeys[0]).await?;
    let _ = create_user_token_account(user_token_b_account,pubkeys[6], pubkeys[0]).await?;

    println!("handling add liquidity instruction");
    Ok(())
}

pub async fn handle_withdraw_liquidity(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    _minimum_liquidity: u64,
    slot: u64
) -> anyhow::Result<()> {
    let rpc = get_rpc().clone();
    let mut pubkeys: Vec<Address> = vec![];

    for i in accounts {
        pubkeys.push(account_keys[i as usize]);
    }

    // all the account details used in the create token instruction
    let account_details: solana_client::rpc_response::Response<Vec<Option<solana_client::rpc_response::UiAccount>>> = rpc.get_multiple_ui_accounts_with_config(&pubkeys, RpcAccountInfoConfig {
        encoding: Some(UiAccountEncoding::Base64),
        commitment: Some(CommitmentConfig::confirmed()),
        data_slice: None,
        min_context_slot: Some(slot),
    }).await?;
    
    //fetching and handling position account
    let position_account: Option<solana_client::rpc_response::UiAccount> = account_details.value[12].clone();

    let position_data: DbPositionAccount = get_position_account(pubkeys[12]).await?;
    match position_account{
        Some(acc) =>{
            let decoded_account: Account = acc.decode()
            .ok_or(anyhow!("Error decoding position account!"))?;
            
            let update_result = handle_update_or_delete_position_account(decoded_account, pubkeys[0], pubkeys[1]).await?;
            println!("update position result: {:?}", update_result);
        }
        None =>{
            let delete_result = delete_position_account(pubkeys[12]).await?;
            println!("delete position account: {:?}", delete_result);
        }
    };
    //handling tick array accounts
    let tick_array_account_one: Account = account_details.value[13]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let tick_array_account_two: Account = account_details.value[14]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let start_tick: u32 = position_data.start_tick.parse::<u32>()?;
    let last_tick: u32 = position_data.end_tick.parse::<u32>()?; 
    let _ = handle_create_active_tick(tick_array_account_one, start_tick, pubkeys[2]).await?;
    let _ = handle_create_active_tick(tick_array_account_two, last_tick,pubkeys[2]).await?;

    //handling user token accounts
    let user_token_a_account: Account = account_details.value[5]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let user_token_b_account: Account = account_details.value[6]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = create_user_token_account(user_token_a_account,pubkeys[5], pubkeys[0]).await?;
    let _ = create_user_token_account(user_token_b_account,pubkeys[6], pubkeys[0]).await?;


    println!("handling withdraw liquidity instruction!");
    Ok(())
}

pub async fn handle_swap(
    account_keys: Vec<Address>,
    accounts: Vec<u8>,
    amount_in: u64,
    minimum_amount_out: u64,
    mint_address_in: Address,
    mint_address_out: Address,
    slot: u64
) -> anyhow::Result<()> {
let rpc = get_rpc().clone();
    let mut pubkeys: Vec<Address> = vec![];

    for i in accounts {
        pubkeys.push(account_keys[i as usize]);
    }

    // all the account details used in the create token instruction
    let account_details: solana_client::rpc_response::Response<Vec<Option<solana_client::rpc_response::UiAccount>>> = rpc.get_multiple_ui_accounts_with_config(&pubkeys, RpcAccountInfoConfig {
        encoding: Some(UiAccountEncoding::Base64),
        commitment: Some(CommitmentConfig::confirmed()),
        data_slice: None,
        min_context_slot: Some(slot),
    }).await?;

    //handling token account
    let amm_token_account: Account = account_details.value[2]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let update_market_result = update_market_token_account(amm_token_account, pubkeys[2]).await?;
    println!("update market result: {:?}", update_market_result);

    //handling user token accounts
    let user_token_a_account: Account = account_details.value[5]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;
    let user_token_b_account: Account = account_details.value[6]
        .clone()
        .ok_or(anyhow!("Position Account not found!"))?
        .decode()
        .ok_or(anyhow!("Error decoding position account!"))?;

    let _ = create_user_token_account(user_token_a_account,pubkeys[5], pubkeys[0]).await?;
    let _ = create_user_token_account(user_token_b_account,pubkeys[6], pubkeys[0]).await?;

    println!("handling swap instruction!");
    Ok(())
}

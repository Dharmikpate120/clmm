use std::str::FromStr;

use anyhow::anyhow;
use solana_address::Address;
use solana_client::rpc_response::transaction::{ CompiledInstruction, VersionedMessage };
use solana_sdk::{ account, message, transaction::VersionedTransaction };
use solana_transaction_status_client_types::EncodedConfirmedTransactionWithStatusMeta;

use crate::transaction_handler::{
    handle_instructions::{
        handle_add_liquidity, handle_initialize_token_pool, handle_swap, handle_withdraw_liquidity
    },
    instruction::{ CLMM_ADDRESS, CLMMInstruction },
};
// use solana_transaction_status::EncodedConfirmedTransactionWithStatusMeta;
// use solana_transaction_status::EncodedConfirmedTransactionWithStatusMeta;

pub async fn handle_transaction(
    transaction: EncodedConfirmedTransactionWithStatusMeta
) -> anyhow::Result<()> {
    let tx_message = transaction.transaction.transaction
        .decode()
        .ok_or_else(|| anyhow!("tx message is missing in transaction!"))?;
    println!(
        "world: {:?} \n hello: {:?} \n helloooooooooooooo: {:?}",
        transaction.transaction,
        transaction.transaction,
        tx_message
    );

    match tx_message.message {
        VersionedMessage::Legacy(message) => {
            println!("in 1");
            handle_instructions(message.instructions, message.account_keys, transaction.slot).await?;
        }
        VersionedMessage::V0(message) => {
            println!("in 2");
            handle_instructions(message.instructions, message.account_keys,transaction.slot).await?;
        }
    }

    Ok(())
}

pub async fn handle_instructions(
    instructions: Vec<CompiledInstruction>,
    account_keys: Vec<Address>,
    slot: u64
) -> anyhow::Result<()> {
    for instruction in instructions {
        println!("instructions: {:?}, {:?}", account_keys[instruction.program_id_index as usize],Address::from_str(CLMM_ADDRESS)?);
        // let data = bs58::decode(instruction.data).into_vec()?;
        // println!("instruction data: {:?}", instruction.data);
        if account_keys[instruction.program_id_index as usize] != Address::from_str(CLMM_ADDRESS)? {
            continue;
        }
        let decoded = CLMMInstruction::unpack(&instruction.data)?;
        println!("handling: 1: {:?}", decoded);
        match decoded {
            CLMMInstruction::InitializeTokenPool {
                token_a_amount,
                token_b_amount,
                start_tick,
                end_tick,
            } => {
                handle_initialize_token_pool(
                    account_keys.clone(),
                    instruction.accounts,
                    token_a_amount,
                    token_b_amount,
                    start_tick,
                    end_tick,
                    slot
                ).await?;
            }
            CLMMInstruction::AddLiquidity { liquidity, start_tick, end_tick } => {
                handle_add_liquidity(
                    account_keys.clone(),
                    instruction.accounts,
                    liquidity,
                    start_tick,
                    end_tick, 
                    slot
                ).await?;
            }
            CLMMInstruction::WithdrawLiquidity { minimum_liquidity } => {
                handle_withdraw_liquidity(
                    account_keys.clone(),
                    instruction.accounts,
                    minimum_liquidity,
                    slot
                ).await?;
            }
            CLMMInstruction::Swap {
                amount_in,
                minimum_amount_out,
                mint_address_in,
                mint_address_out,
            } => {
                handle_swap(
                    account_keys.clone(),
                    instruction.accounts,
                    amount_in,
                    minimum_amount_out,
                    mint_address_in,
                    mint_address_out,
                    slot
                ).await?;
            }
        }
    }
    Ok(())
}

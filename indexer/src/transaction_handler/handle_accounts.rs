use anyhow::anyhow;
use solana_account::Account;
use solana_address::Address;
// use solana_sdk::account::Account;
use sqlx::PgPool;

use crate::transaction_handler::state::{AMMAccount, PositionAccount};

pub async fn handle_create_market(token_account: Account, pg: &PgPool) -> anyhow::Result<()> {
    let data = AMMAccount::unpack_from_slice(&token_account.data)?;
    match data {
        AMMAccount::Uninitialized => {
            return Err(anyhow!("token account not initialized!"));
        }
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
            let _ = sqlx
                ::query!(
                    "INSERT INTO markets VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8);",
                    token_a_mint.to_string(),
                    token_b_mint.to_string(),
                    sqrt_price_a_by_b.to_string(),
                    current_tick.to_string(),
                    fee_growth.to_string(),
                    active_liquidity.to_string(),
                    token_a_pool.to_string(),
                    token_b_pool.to_string()
                )
                .execute(pg).await;
        }
    }
    Ok(())
}

pub async fn handle_update_token_account(
    token_account: Account,
    pg: &PgPool
) -> anyhow::Result<()> {
    let data = AMMAccount::unpack_from_slice(&token_account.data)?;
    match data {
        AMMAccount::Uninitialized => {
            return Err(anyhow!("token account not initialized!"));
        }
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
            let _ = sqlx
                ::query!(
                    "UPDATE markets SET  current_price = $1, current_tick = $2, fees = $3, active_liquidity = $4, pool_address_a = $5, pool_address_b = $6 WHERE mint_address_a = $7 AND mint_address_b = $8;",
                    sqrt_price_a_by_b.to_string(),
                    current_tick.to_string(),
                    fee_growth.to_string(),
                    active_liquidity.to_string(),
                    token_a_pool.to_string(),
                    token_b_pool.to_string(),
                    token_b_mint.to_string(),
                    token_a_mint.to_string()
                )
                .execute(pg).await;
        }
    }
    Ok(())
}

pub async fn handle_create_position_account(
    position_account: Account,
    pg: &PgPool,
    user_address: Address,
    nft_address: Address
) -> anyhow::Result<()> {
    let data = PositionAccount::unpack_from_slice(&position_account.data)?;
    match data {
        PositionAccount::Uninitialized => {
            return Err(anyhow!("token account not initialized!"));
        }
        PositionAccount::Initialized {
            start_tick, //32
            end_tick,
            liquidity,
        } => {
            let _ = sqlx
                ::query!(
                    "INSERT INTO position_accounts VALUES (DEFAULT, $1, $2, $3, $4, $5)",
                    user_address.to_string(),
                    nft_address.to_string(),
                    start_tick.to_string(),
                    end_tick.to_string(),
                    liquidity.to_string()
                )
                .execute(pg).await;
        }
    }
    Ok(())
}

pub async fn handle_update_or_delete_position_account(
    position_account: Account,
    pg: &PgPool,
    user_address: Address,
    nft_address: Address
) -> anyhow::Result<()> {
    let data = PositionAccount::unpack_from_slice(&position_account.data)?;
    match data {
        PositionAccount::Uninitialized => {
            let _ = sqlx
                ::query!(
                    "DELETE FROM position_accounts WHERE nft_address = $1;",
                    nft_address.to_string(),
                )
                .execute(pg).await;
        }
        PositionAccount::Initialized {
            start_tick, //32
            end_tick,
            liquidity,
        } => {
            let _ = sqlx
                ::query!(
                    "UPDATE position_accounts SET user_address = $1,  start_tick = $2, end_tick = $3, liquidity = $4 where nft_address = $5;",
                    user_address.to_string(),
                    start_tick.to_string(),
                    end_tick.to_string(),
                    liquidity.to_string(),
                    nft_address.to_string(),
                )
                .execute(pg).await;
        }
    }
    Ok(())
}

pub async fn handle_create_active_tick(
    position_account: Account,
    pg: &PgPool,
    user_address: Address,
    nft_address: Address
) -> anyhow::Result<()> {
    let data = PositionAccount::unpack_from_slice(&position_account.data)?;
    match data {
        PositionAccount::Uninitialized => {
            let _ = sqlx
                ::query!(
                    "DELETE FROM position_accounts WHERE nft_address = $1;",
                    nft_address.to_string(),
                )
                .execute(pg).await;
        }
        PositionAccount::Initialized {
            start_tick, //32
            end_tick,
            liquidity,
        } => {
            let _ = sqlx
                ::query!(
                    "UPDATE position_accounts SET user_address = $1,  start_tick = $2, end_tick = $3, liquidity = $4 where nft_address = $5;",
                    user_address.to_string(),
                    start_tick.to_string(),
                    end_tick.to_string(),
                    liquidity.to_string(),
                    nft_address.to_string(),
                )
                .execute(pg).await;
        }
    }
    Ok(())
}

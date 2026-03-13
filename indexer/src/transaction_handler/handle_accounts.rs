use std::result;

use anyhow::anyhow;
use solana_account::Account;
use solana_address::Address;
use solana_sdk::program_pack::Pack;
// use solana_sdk::account::Account;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{ db_helper::get_pg, transaction_handler::state::{ AMMAccount, PositionAccount, TICK_ARRAY_SIZE } };

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct Market {
    pub id: Uuid,
    pub mint_address_a: String,
    pub mint_address_b: String,
    pub current_price: String,
    pub current_tick: String,
    pub fees: String,
    pub active_liquidity: String,
    pub pool_address_a: String,
    pub pool_address_b: String,
    pub market_address: String
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct User {
    pub id: String,
    pub username: String,
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct UserToken{
    pub id: Uuid,
    pub user_address: String,
    pub token_mint_address: String,
    pub token_address: String,
    pub balance: String
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ActiveTick{
    pub id: Uuid,
    pub market_id: Uuid,
    pub tick_position: i32,
    pub net_liquidity: String
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct DbPositionAccount{
    pub id: Uuid,
    pub user_address: String,
    pub nft_address: String,
    pub start_tick: String,
    pub end_tick: String,
    pub liquidity: String,
    pub position_address: Option<String>

}
pub async fn handle_create_token_account(
    token_account: Account,
    market_address: Address
 ) -> anyhow::Result<()> {
    let db = get_pg().await;
    println!("{:?}", token_account.data.len());
    let data = AMMAccount::unpack_from_slice(&token_account.data)?;
    println!("token_account data: {:?}", data);
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
                    "INSERT INTO markets VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9);",
                    token_a_mint.to_string(),
                    token_b_mint.to_string(),
                    sqrt_price_a_by_b.to_string(),
                    current_tick.to_string(),
                    fee_growth.to_string(),
                    active_liquidity.to_string(),
                    token_a_pool.to_string(),
                    token_b_pool.to_string(),
                    market_address.to_string()
                )
                .execute(db).await;
        }
    }
    Ok(())
}

pub async fn update_market_token_account(token_account: Account,
    market_address: Address) -> anyhow::Result<()>{
        let db = get_pg().await;

        let _ = sqlx::query_as!(Market,"SELECT * FROM markets WHERE market_address = $1;", market_address.to_string()).fetch_one(db).await?;
     let data = AMMAccount::unpack_from_slice(&token_account.data)?;
    println!("token_account data: {:?}", data);
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
            let update_result = sqlx::query!(
                "UPDATE markets SET current_price = $1, current_tick = $2, active_liquidity = $3 WHERE market_address = $4;",
                sqrt_price_a_by_b.to_string(),
                current_tick.to_string(),
                active_liquidity.to_string(),
                market_address.to_string()
        ).execute(db).await?;
     
    }
}

        Ok(())
    }
pub async fn create_token_pool_account(
    token_a_pool_account_temp: Account,
    token_b_pool_account_temp: Account
) -> anyhow::Result<()> {
    let db = get_pg().await;
    let data_a = spl_token_interface::state::Account::unpack(&token_a_pool_account_temp.data)?;
    let data_b = spl_token_interface::state::Account::unpack(&token_b_pool_account_temp.data)?;

    let token_a_address;
    let token_b_address;
    // println!("a: {:?}, b: {:?}",data_a.mint, data_b.mint);
    if data_a.mint < data_b.mint {
        token_a_address = data_a.mint;
        token_b_address = data_b.mint;
    } else {
        token_a_address = data_b.mint;
        token_b_address = data_a.mint;
    }

    // here the address needs to be stored in canonical order in db other wise it won't work and the addresses passed also needs to be in canonical order
    let market: Market = sqlx
        ::query_as!(
            Market,
            "SELECT * FROM markets WHERE mint_address_a = $1 AND mint_address_b = $2;",
            token_a_address.to_string(),
            token_b_address.to_string()
        )
        .fetch_one(db).await?;

    let _ = sqlx
        ::query!(
            "INSERT INTO token_pool values (DEFAULT, $1, $2, $3, $4);",
            market.id,
            data_a.mint.to_string(),
            market.pool_address_a,
            data_a.amount.to_string()
        )
        .execute(db).await?;

    let _ = sqlx
        ::query!(
            "INSERT INTO token_pool values (DEFAULT, $1, $2, $3, $4);",
            market.id,
            data_b.mint.to_string(),
            market.pool_address_b,
            data_b.amount.to_string()
        )
        .execute(db).await?;
    Ok(())
}

pub async fn handle_update_token_account(
    token_account: Account,
    market_address:Address,
) -> anyhow::Result<()> {
    let db = get_pg().await;
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
                    "UPDATE markets SET  current_price = $1, current_tick = $2, fees = $3, active_liquidity = $4, pool_address_a = $5, pool_address_b = $6, market_address = $7 WHERE mint_address_a = $8 AND mint_address_b = $9;",
                    sqrt_price_a_by_b.to_string(),
                    current_tick.to_string(),
                    fee_growth.to_string(),
                    active_liquidity.to_string(),
                    token_a_pool.to_string(),
                    token_b_pool.to_string(),
                    market_address.to_string(),
                    token_b_mint.to_string(),
                    token_a_mint.to_string()
                )
                .execute(db).await;
        }
    }
    Ok(())
}

pub async fn handle_create_position_account(
    position_account: Account,
    user_address: Address,
    nft_address: Address,
    position_address: Address
) -> anyhow::Result<()> {
    let db: &sqlx::Pool<sqlx::Postgres> = get_pg().await;
    let position_data: PositionAccount = PositionAccount::unpack_from_slice(
        &position_account.data
    )?;
    let user_data = get_or_create_user(User { id: user_address.to_string(), username: user_address.to_string() }).await?;
        
    match position_data {
        PositionAccount::Uninitialized => {
            return Err(anyhow!("position account not initialized!"));
        }
        PositionAccount::Initialized {
            start_tick, //32
            end_tick,
            liquidity,
        } => {
            let mut temp_liq =(liquidity as f64) / (2.0 as f64).powi(64);
            temp_liq *=temp_liq;
            let _ = sqlx
                ::query!(
                    "INSERT INTO position_accounts VALUES (DEFAULT, $1, $2, $3, $4, $5, $6)",
                    user_data.id.to_string(),
                    nft_address.to_string(),
                    start_tick.to_string(),
                    end_tick.to_string(),
                    temp_liq.to_string(),
                    position_address.to_string()
                )
                .execute(db).await;
        }
    }
    Ok(())
}

pub async fn handle_update_or_delete_position_account(
    position_account: Account,
    user_address: Address,
    nft_address: Address
) -> anyhow::Result<()> {
    let db = get_pg().await;
    let data = PositionAccount::unpack_from_slice(&position_account.data)?;
    match data {
        PositionAccount::Uninitialized => {
            let _ = sqlx
                ::query!(
                    "DELETE FROM position_accounts WHERE nft_address = $1;",
                    nft_address.to_string()
                )
                .execute(db).await;
        }
        PositionAccount::Initialized {
            start_tick, //32
            end_tick,
            liquidity,
        } => {
            let mut temp_liq =(liquidity as f64) / (2.0 as f64).powi(64);
            temp_liq *=temp_liq;
            let _ = sqlx
                ::query!(
                    "UPDATE position_accounts SET user_address = $1,  start_tick = $2, end_tick = $3, liquidity = $4 where nft_address = $5;",
                    user_address.to_string(),
                    start_tick.to_string(),
                    end_tick.to_string(),
                    temp_liq.to_string(),
                    nft_address.to_string()
                )
                .execute(db).await;
        }
    }
    Ok(())
}

pub async fn delete_position_account(position_address: Address) -> anyhow::Result<()>{
    let db = get_pg().await;
    let _ = sqlx::query!("DELETE FROM position_accounts WHERE position_address = $1;", position_address.to_string()).execute(db).await?;
    
    Ok(())
}
pub async fn get_position_account(position_address: Address) -> anyhow::Result<DbPositionAccount>{
    let db = get_pg().await;
    let position_data = sqlx::query_as!(DbPositionAccount, "SELECT * FROM position_accounts WHERE position_address = $1;", position_address.to_string()).fetch_one(db).await?;
    Ok(position_data)
}
pub async fn create_user_token_account(
    user_token_account: Account,
    token_address:Address,
    user_address: Address
) -> anyhow::Result<()> {
    let db: &sqlx::Pool<sqlx::Postgres> = get_pg().await;

    let user_token_data = spl_token_interface::state::Account::unpack(&user_token_account.data)?;

    let user_token_data_db = sqlx::query_as!(UserToken, "SELECT * FROM user_token_accounts WHERE user_address = $1 AND token_mint_address = $2;", user_address.to_string(), user_token_data.mint.to_string()).fetch_optional(db).await?;

    match user_token_data_db{
        Some(_)=> {
            let _ = sqlx::query!(
                "UPDATE user_token_accounts SET balance = $1 WHERE user_address = $2 AND token_mint_address = $3;", 
                user_token_data.amount.to_string(), 
                user_address.to_string(), 
                user_token_data.mint.to_string()
            ).execute(db).await?;
        }
        None =>{
            let user = get_or_create_user(User { id: user_address.to_string(), username: user_address.to_string() }).await?;
            
            let _ = sqlx::query!(
                "INSERT INTO user_token_accounts VALUES (DEFAULT, $1, $2, $3, $4);",
                user.id,
                user_token_data.mint.to_string(),
                token_address.to_string(),
                user_token_data.amount.to_string()
            ).execute(db).await?;
        }
            
    }


    Ok(())
}

pub async fn get_or_create_user(user_data: User) -> anyhow::Result<User>{
    let db = get_pg().await;
    let user = sqlx
        ::query_as!(User, "SELECT * FROM users where id = $1;", user_data.id)
        .fetch_optional(db).await?;
    let user_data = match user {
        None => {
            let _ = sqlx
                ::query!(
                    "INSERT INTO users VALUES ($1, $2);",
                    user_data.id,
                    user_data.id
                )
                .execute(db).await?;

            User { id: user_data.id.clone(), username: user_data.id.clone() }
        }
        Some(user) => { user }
    };
    Ok(user_data)
}
pub async fn handle_create_active_tick(
    tick_array_account: Account,
    tick_index: u32,
    market_address: Address
) -> anyhow::Result<()> {
    let db: &sqlx::Pool<sqlx::Postgres> = get_pg().await;
    let tick_tail = tick_index % TICK_ARRAY_SIZE;
    let data: &[i64] = bytemuck::cast_slice(&tick_array_account.data);
    println!("active tick data: {:?}", data);
    let net_liquidity = data[tick_tail as usize];
    println!("tick_tail: {:?}, {:?}, {:?}", tick_tail, tick_index, net_liquidity);
    
    let market = sqlx::query_as!(
        Market, 
        "SELECT * FROM markets WHERE market_address = $1;", 
        market_address.to_string()
    ).fetch_one(db).await?;

    let active_tick = sqlx::query_as!(
        ActiveTick, 
        "SELECT * FROM active_ticks where market_id = $1 AND tick_position = $2;", 
        market.id, 
        tick_index as i32
    ).fetch_optional(db).await?;
    
    match active_tick{
        Some(tick) =>{
            let _ = sqlx::query!(
                "UPDATE active_ticks SET net_liquidity = $1 WHERE id = $2;", 
                net_liquidity.to_string(), 
                tick.id
            ).execute(db).await?;
        }
        None=>{
            let _ = sqlx::query!(
                "INSERT INTO active_ticks VALUES (DEFAULT, $1, $2, $3);",
                market.id,
                tick_index as i32,
                net_liquidity.to_string()
            ).execute(db).await?;
        }
    }
    Ok(())
}

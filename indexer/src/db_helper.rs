use std::sync::OnceLock;

use clap::Parser;
use sqlx::PgPool;

use crate::config::Config;

pub static DB: OnceLock<PgPool> = OnceLock::new();
    
pub async fn init_pg(conf: &Config) -> anyhow::Result<()>{
     DB.set(sqlx::postgres::PgPoolOptions::new().max_connections(50).connect(&conf.database_uri).await?).expect("DBpool already initialized!");
     println!("initializing.......");
    Ok(())
}

pub async fn get_pg() -> &'static PgPool{
    DB.get().expect("DB Pool is not initialized!")
}   
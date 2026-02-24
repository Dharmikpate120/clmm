use lepo::{config::{self, Config}, db_helper::{get_pg, init_pg}, rpc_helper::{get_rpc, init_rpc_tcp}, transaction_handler::handle_transaction};
use solana_client::{
    pubsub_client::PubsubClient,
    rpc_config::{
        CommitmentConfig,
        RpcTransactionConfig,
        RpcTransactionLogsConfig,
        RpcTransactionLogsFilter,
    },
};
use solana_signature::Signature;
use solana_transaction_status_client_types::UiTransactionEncoding;
use tokio::{sync::mpsc, task };
use std::{ thread::sleep, time::Duration };
use std::str::FromStr;
use clap::Parser;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    let conf = config::Config::parse();
    let _ = init_pg(&conf).await?;
    let _ = init_rpc_tcp(&conf)?;
    let db = get_pg().await;
    sqlx::migrate!().run(db).await?;
    let pg = get_pg().await;
    let market = sqlx::query!(
                "INSERT INTO markets VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8);",
                "token_a_mint.to_string()",
                "token_b_mint.to_string()",
                "sqrt_price_a_by_b.to_string()",
                "current_tick.to_string()",
                "fee_growth.to_string()",
                "active_liquidity.to_string()",
                "token_a_pool.to_string()",
                "token_b_pool.to_string()"
            ).execute(pg).await;

    let mut connected = false;
    loop{
        if connected{
            continue
        };
        match connect(&conf).await{
            Ok(_) => {
                connected = true;
                ()},
            Err(err) => {
                println!("disconnected!: {:?}", err);
                connected = false;
            }
        };
    }
    // Ok(())
}

async fn connect(conf:&Config) -> anyhow::Result<()>{

    
    

    let (rpc_client_subscription, receiver) = PubsubClient::logs_subscribe(
        conf.rpc_websocket_url.clone(),
        RpcTransactionLogsFilter::Mentions(vec!["KpxeS8pjg8P7o3b39cmfWd8KiZ1yc4gC2oFcYuc5beX".to_string()]),
        RpcTransactionLogsConfig {
            commitment: Some(CommitmentConfig::confirmed()),
        }
    )?;
    
    let rpc_client_tcp = get_rpc();

    println!("pringing logs ...");
    
    let (tx_sender,mut tx_receiver) = mpsc::channel::<Signature>(1000);
    
    task::spawn_blocking(move || {
        for tx in receiver {
            // println!("tx: {:?}", tx.value.signature);
            let sign = match Signature::from_str(&tx.value.signature) {
                Ok(sign) => sign,
                _ => {
                    continue;
                }
            };
            // println!("sending transactions");
            let _ = tx_sender.blocking_send(sign);
        }
    });
    println!("spawning receivers");
    // return Err(Error::new());
    while let Some(signature) = tx_receiver.recv().await{
        // println!("signature:::::::::::::{:?}", signature);
        let rpc_client_clone = rpc_client_tcp.clone();
        task::spawn(async move {
            // println!("txsent");
            let transaction = loop {
                match
                rpc_client_clone.get_transaction_with_config(&signature, RpcTransactionConfig {
                    commitment: Some(CommitmentConfig::confirmed()),
                    encoding: Some(UiTransactionEncoding::Base58),
                    max_supported_transaction_version: Some(128),
                }).await
                {
                    Ok(tx) => {
                        // println!("tx received");
                        break tx;
                    }
                    Err(err) => {
                        println!("sleeping: {:?}", err);
                        sleep(Duration::from_millis(500));
                        continue;
                    }
                }
            };
            println!("transaction received: {:?}", transaction);
            let res = handle_transaction::handle_transaction(transaction).await;
            println!("{:?}",res);
        });
    }
    println!("outside while");
    println!("exiting...");
    rpc_client_subscription.send_unsubscribe()?;
    Ok(())
}

// lepo::http::serve(config,db).await?;

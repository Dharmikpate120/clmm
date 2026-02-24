use std::sync::{Arc, OnceLock};

// use anyhow::anyhow;
use solana_client::nonblocking::rpc_client::RpcClient;

use crate::config::Config;


pub static RPC_TCP: OnceLock<Arc<RpcClient>> = OnceLock::new();
pub fn init_rpc_tcp(conf:&Config)-> anyhow::Result<()>{
    //check the match arm not optimal asdfghjkl;'
    match RPC_TCP.set(Arc::new(RpcClient::new(conf.rpc_tcp_url.to_string()))){
        Ok(_) =>{
            ()
        },
        Err(_) =>{
            ()
            // anyhow!("RPC client already initialized!")
        }
    };
    Ok(())
}

pub fn get_rpc() -> &'static Arc<RpcClient>{
    RPC_TCP.get().expect("RPC not initialized!")
}
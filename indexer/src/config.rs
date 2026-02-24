
#[derive(clap::Parser,Debug, Clone)]
pub struct Config{

    #[arg(long, env="POSTGRES_URL")]
    pub database_uri:String,

    #[arg(long, env="PORT")]
    pub port:u16,

    #[arg(long, env="HOST")]
    pub host:String,

    #[arg(long, env="RPC_WEBSOCKET_URL")]
    pub rpc_websocket_url: String,

    #[arg(long, env="RPC_TCP_URL")]
    pub rpc_tcp_url: String

}
// use std::error::Error;

use axum::{Extension, Router};
use sqlx::{PgPool};
use tower::ServiceBuilder;

use crate::{config::Config, http::routes::auth};
use tower_http::trace::TraceLayer;

mod routes;
mod extractor;
mod error;
mod types;
// mod gemini;
// mod postgres;
use crate::http::routes::users;

pub use error::Error;

pub type Result<T, E = Error> = std::result::Result<T, E>;

#[derive(Clone, Debug)]
pub struct AppContext{
 config: Config,
 db:PgPool

}

pub async fn serve(config:Config, db:PgPool) -> anyhow::Result<()> {
    
    let app = api_router().layer(
        ServiceBuilder::new()
    )
    .layer(Extension(AppContext{
        config: config.clone(),
        db:db
    }))
    .layer(TraceLayer::new_for_http());
    let listener = tokio::net::TcpListener::bind(&format!("{}:{}",config.host,config.port)).await?;
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

fn api_router() -> Router{
    users::router()
        .merge(auth::router())
}
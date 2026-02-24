use std::future::ready;

use crate::http::error::Error;
use axum::{body::Body, extract::{FromRequest, FromRequestParts, Request}, http::request::Parts, RequestPartsExt};
use axum_extra::TypedHeader;
use serde::Deserialize;
use uuid::Uuid;
use headers::{authorization::Bearer, Authorization};
// use axum::extract::FromRequest;


pub struct AuthUser{
    pub user_id: String,
}


// #[derive(Deserialize)]
// struct Body1{
// 
// }

// #[async_trait::async_trait]
impl <S> FromRequestParts<S> for AuthUser where S: Send + Sync{
    type Rejection = Error;
    fn from_request_parts(req:&mut Parts, state:&S)->impl Future<Output=Result<Self, Self::Rejection>> + Send{
        println!("authorization:{:?}", req.headers.get("authorization"));
        
        
        
        let result = Ok(Self{
            user_id: "hello".to_string()
        });
        ready(result)
    }
}
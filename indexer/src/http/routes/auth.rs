use axum::{Extension, Json, Router, routing::post};
// use serde::{Deserialize, Serialize};

// use crate::http::{AppContext, Result};



pub fn router()->Router{
    Router::new()
    // .route("/auth/signup", post(auth_signup))
}

// #[derive(Deserialize,Serialize)]
// pub struct SigninBody{
//     username:String,
//     email:String,
//     github_access_token:String
// }

// #[axum::debug_handler]
// async fn auth_signup(ctx:Extension<AppContext>, body:Json<SigninBody>)->Result<String>{
//     println!("{:?}",ctx);


//     let query = sqlx::query!(
//         "INSERT INTO users (username, email, github_access_token, bio, image, password_hash) VALUES ($1, $2, $3, $4, $5, $6)",
//         body.username,  
//         body.email,
//         body.github_access_token,
//         "",
//         "",
//         ""
//     ).execute(&ctx.db).await;
//     println!("{:?}", query);

//     Ok("signiing in".to_string())
// }
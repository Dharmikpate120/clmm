use axum::body::Body;
use axum::response::IntoResponse;
use axum::{Extension, Json, Router};
use axum::routing::{get, post};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::http::gemini::functions::skills_extractor;
use crate::http::types::commitsresponse::CommitsResponse;
use crate::http::types::githubcommits::GithubCommits;
use crate::http::{AppContext, Error, Result};
use crate::http::extractor::AuthUser;
use crate::http::types::githubrepo::GithubRepoRes;


#[derive(Deserialize, Debug)]
pub struct BodyStruct{
    pub access_token:String,
    pub repo_name:String,
    pub user_name: String,
    pub user_email: String
    
}

#[derive(serde::Serialize)]
pub struct GetSkillsreturn{
    pub skills: Vec<String>
}

#[derive(Deserialize, Serialize)]
pub struct CommitDiff{
    pub commit: String
}

pub fn router() ->Router{
    Router::new().route("/get-skills", post(get_handler)).route("/",get(home_handler))
}

#[axum::debug_handler] 
async fn home_handler()->String{
    "hello welcome to lepo".to_string()
}

#[axum::debug_handler]
async fn get_handler(auth_user:AuthUser, ctx:Extension<AppContext>, Json(body):Json<BodyStruct>) ->  Result<Json<Vec<CommitsResponse>>>{
    let client = Client::new();
    let response = client.get(format!("https://api.github.com/repos/{}/{}/commits", &body.user_name, &body.repo_name)).header("User-Agent","Lepo/1.0").send().await?.text().await?;
    
    let user_commits :Vec<GithubCommits> = serde_json::from_str(&response)?;

    //gemini calling function to extract skills
    let result = skills_extractor(user_commits,body, &ctx).await;

    //extracting Commitsresponse from result
    let skills_list;
    let skills;
    match result{
        Ok(sk)=>{
            skills_list = sk.0;
            skills = sk.1;
        }
        Err(err) => {
            println!("{:?}",err);
            return Err(crate::http::error::Error::RequestFailed);
        }
    }

    // println!("{:#?}, {}",user_commits, user_commits.len());
    // let mut commit_vec: Vec<CommitDiff> = vec![];
    
    // println!("{:#?}",skills);

    

    // println!("accesstoken:{}", body.access_token);
    Ok(Json(skills))

}
use axum::{ Extension, Json, Router };
// use axum::routing::{post, get};
// use reqwest::{Client};
// use serde::{Deserialize, Serialize};
// use uuid::Uuid;
// use crate::http::gemini::functions::skills_extractor;
// use crate::http::types::commitsresponse::{CommitsResponse, FirstCommitsResponse};
// use crate::http::types::githubcommits::GithubCommits;
// use crate::http::{AppContext, Result};
// use chrono::{DateTime, Utc};

// #[derive(Deserialize, Debug)]
// pub struct BodyStruct{
//     pub access_token:String,
//     pub repo_name:String,
//     pub user_name: String,
//     pub user_email: String

// }

// #[derive(serde::Serialize)]
// pub struct GetSkillsreturn{
//     pub skills: Vec<String>
// }

// #[derive(Deserialize, Serialize)]
// pub struct CommitDiff{
//     pub commit: String
// }

// #[derive(sqlx::FromRow, Debug, Clone)]
// pub struct User {
//     summary:String,
//     username:String,
//     repo_name:String,
//     summary_id:Uuid
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct StoredSummary{
//     pub initial_commit: FirstCommitsResponse,
//     pub all_commits: Vec<CommitsResponse>
// }

pub fn router() -> Router {
    Router::new()
    // .route("/git/calculate-skills", post(get_handler))
    // .route("/",get(home_handler))
}

// #[axum::debug_handler]
// async fn home_handler() -> String{
//     "hello from dharmik in lepo".to_string()
// }

// #[axum::debug_handler]
// async fn get_handler( ctx:Extension<AppContext>, Json(body):Json<BodyStruct>) ->  Result<Json<(FirstCommitsResponse,Vec<CommitsResponse>)>>{

//     //fetching currently stored user's details
//     let user= sqlx::query_as!(User,"SELECT commit_summary.summary, commit_summary.username, commit_summary.repo_name, commit_summary.summary_id FROM commit_summary INNER JOIN users ON commit_summary.user_id = users.user_id WHERE repo_name = $1 AND commit_summary.username=$2;
//     ",
//     &body.repo_name,
//     &body.user_name
//     ).fetch_one(&ctx.db).await?;

//     let stored_summary:StoredSummary = serde_json::from_str(&user.summary)?;

//     //getting all the commits from the github
//     let client = Client::new();
//     let response = client.get(format!("https://api.github.com/repos/{}/{}/commits", &body.user_name, &body.repo_name)).header("User-Agent","Lepo/1.0").send().await?.text().await?;
//     // println!("{}",response);
//     let user_commits :Vec<GithubCommits> = serde_json::from_str(&response)?;

//     //gemini calling function to extract skills
//     let result = skills_extractor(stored_summary,user_commits,&body, &ctx).await;

//     // //extracting Commitsresponse from result
//     let skills_list: FirstCommitsResponse ;
//     // skills_list = FirstCommitsResponse{
//     //     commit_id:"".to_string(),
//     //     commit_message:"".to_string(),
//     //     technologies: vec![]
//     // };
//     let skills: Vec<CommitsResponse>;
//     // skills = vec![];
//     match result{
//         Ok(sk)=>{
//             skills_list = sk.0;
//             skills = sk.1;
//         }
//         Err(err) => {
//             println!("{:?}",err);
//             return Err(crate::http::error::Error::RequestFailed);
//         }
//     }
// //
//     //
//     println!("{:?}", serde_json::to_string(
//         &StoredSummary{
//         initial_commit: FirstCommitsResponse {
//             commit_id: "()".to_string(),
//             commit_message: "()".to_string(),
//             technologies: vec![]
//         },
//         all_commits: vec![]
//     }));
//     // println!("{:#?}, {}",&user_commits, &user_commits.len());
//     let mut commit_vec: Vec<CommitDiff> = vec![];
//     //
//     println!("{:#?}",skills);
// //
//     //
// //
//     println!("accesstoken:{}", body.access_token);
//     Ok(Json((skills_list,skills)))
// //
// }

// asdfghjkl;'
// EncodedConfirmedTransactionWithStatusMeta {
//     slot: 445050393,
//     transaction: EncodedTransactionWithStatusMeta {
//         transaction: VersionedTransaction {
//             signatures: [
//                 p8dqjfD5482v5oK3Cf2XnSRaV9WFHAcLJPFLpUr14c2XrPxthtNLCfipS52eD24zwNvYzX1AofQyq8pjCxDeQPa,
//                 3YaD87ZqFf3pRGsXgzP4bhTf9Vt1mTizzG3imFypucUZgJuHZPizo3PDE4zqXWy4FDsR5ffitjvrtCa1dXyNeKx,
//             ],
//             message: Legacy(Message {
//                 header: MessageHeader {
//                     num_required_signatures: 2,
//                     num_readonly_signed_accounts: 0,
//                     num_readonly_unsigned_accounts: 7,
//                 },
//                 account_keys: [
//                     GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3,
//                     DydmAeeNUaVU25FTTetYLWk2s4jr5YDMuNZuKQGYiCSa,
//                     24ASDpTj4H3USFM5RYTtzkK7kfZoVzMifSPFYLTCFtLw,
//                     4eHe47zLKhkxTVZ8Kerw6hVu3GgDQoomHDyQpoiYYAPA,
//                     9a8MFYeNfDZnBZusqhC7gbUee4TMCyHPFb7EVUffzGeg,
//                     9q1bNikBwpbYXfSauH5boizaThd6YKJ1yE28v7XMDJvg,
//                     ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn,
//                     CgvBpwV91WzNPrdGF4Ecv3V5CjXLLw6ZfRSu1FwNRBfc,
//                     CqhSHmnpwdoiG7CuS1UfEfHdsKJRvb7u2dZvyaAveVxr,
//                     CXCX2jPQjyW3DbZ9UqVpeZFLY8mPpKLoLjCzfBkavVab,
//                     Dg3FYdku7nzNvEPrWSkuW7KT51CiFGhKBYkrnyfvFbBk,
//                     J7FfU33MumtrqDjTihSpJ7nxR1RsgKV6fDiy5hb3pRCJ,
//                     11111111111111111111111111111111,
//                     BigWsb3x6jnjaxaJaxDz3RCcB9gu39Z4agkocG6saZky,
//                     CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d,
//                     DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP,
//                     DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu,
//                     SysvarRent111111111111111111111111111111111,
//                     TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,
//                 ],
//                 recent_blockhash: GWRduGAadztYQWNiFxDDzo3YsUszjGRJCkbXzZRdjznR,
//                 instructions: [
//                     CompiledInstruction {
//                         program_id_index: 16,
//                         accounts: [
//                             0, 1, 18, 13, 15, 11, 6, 4, 7, 8, 17, 16, 12, 14, 3, 10, 2, 5, 9,
//                         ],
//                         data: [
//                             0, 100, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 240, 85, 0, 0, 208,
//                             132, 0, 0,
//                         ],
//                     },
//                 ],
//             }),
//         },
//         meta: Some(UiTransactionStatusMeta {
//             err: None,
//             status: Ok(()),
//             fee: 10000,
//             pre_balances: [
//                 8337719280, 0, 0, 0, 0, 0, 2039280, 0, 0, 0, 0, 2039280, 1, 1461600, 10001141440, 1461600,
//                 1141440, 1009200, 8738370969,
//             ],
//             post_balances: [
//                 8159627120, 3066000, 13230960, 1064880, 2039280, 70490880, 2039280, 2039280,
//                 2429040, 70490880, 13230960, 2039280, 1, 1461600, 10001141440, 1461600, 1141440, 1009200,
//                 8738370969,
//             ],
//             inner_instructions: Some([
//                 UiInnerInstructions {
//                     index: 0,
//                     instructions: [
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 8],
//                             data: "111157Ra4EH5zxNkuGWzUqKGT2fbUmgcxoDt7WxU9r5knuEJGooFreEwGEB2KHFEYVeYmZ",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 5],
//                             data: "111112Hp2ex8w7Qo68MhsY9nimD9PnfbXWmr9Gn5HvT5a4gHiugnc6EJdpuiTu1FU17Qqq",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 9],
//                             data: "111112Hp2ex8w7Qo68MhsY9nimD9PnfbXWmr9Gn5HvT5a4gHiugnc6EJdpuiTu1FU17Qqq",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 4],
//                             data: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 7],
//                             data: "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 18,
//                             accounts: [4, 13, 4, 17],
//                             data: "2",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 18,
//                             accounts: [7, 15, 7, 17],
//                             data: "2",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 14,
//                             accounts: [1, 14, 14, 0, 14, 14, 12, 14],
//                             data: "11LTW3vh95qeeoZMUc6pHcLCvfyUwWnAaE1qm6z46qQs",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 1],
//                             data: "11116K35UBpejemdEECqtCYzuQVFBvTaBbn6vhNpJhtcZsqvJjrSGW6QGpSUf4iJtDCAko",
//                             stack_height: Some(3),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 18,
//                             accounts: [11, 4, 0, 0],
//                             data: "3WBgs5fm8oDy",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 18,
//                             accounts: [6, 7, 0, 0],
//                             data: "3F8aKq24k59R",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 3],
//                             data: "11117TynB25swPG3pzLr591dTsvtk2yZRRCjKfrtEZTNCcCxXy17K3MHkg6jW4VfJHWviw",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 10],
//                             data: "111159Bb4SddYFSUMZsAKdUSES9u7Ty1fEQsBmzdofx5wHbjy1oPhVbXaLeFUc44SLXv2o",
//                             stack_height: Some(2),
//                         }),
//                         Compiled(UiCompiledInstruction {
//                             program_id_index: 12,
//                             accounts: [0, 2],
//                             data: "111159Bb4SddYFSUMZsAKdUSES9u7Ty1fEQsBmzdofx5wHbjy1oPhVbXaLeFUc44SLXv2o",
//                             stack_height: Some(2),
//                         }),
//                     ],
//                 },
//             ]),
//             log_messages: Some([
//                 "Program DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu invoke [1]",
//                 "Program log: 1",
//                 "Program log: 2",
//                 "Program log: 3",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: 4",
//                 "Program log: 3",
//                 "Program log: [0, 0, 0, 2], 252, 9q1bNikBwpbYXfSauH5boizaThd6YKJ1yE28v7XMDJvg, CqhSHmnpwdoiG7CuS1UfEfHdsKJRvb7u2dZvyaAveVxr",
//                 "Program log: Current program id: DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu",
//                 "Program log: AMM program account key: DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: [0, 0, 0, 3], 255, CXCX2jPQjyW3DbZ9UqVpeZFLY8mPpKLoLjCzfBkavVab, CqhSHmnpwdoiG7CuS1UfEfHdsKJRvb7u2dZvyaAveVxr",
//                 "Program log: Current program id: DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu",
//                 "Program log: AMM program account key: DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: check status : 250, 7, 0, 0",
//                 "Program log: check status : 500, 7, 0, 0",
//                 "Program log: 5",
//                 "Program log: 5.1",
//                 "Program log: 5.1",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
//                 "Program log: Instruction: InitializeAccount",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4403 of 140978 compute units",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
//                 "Program log: Instruction: InitializeAccount",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4403 of 134498 compute units",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
//                 "Program log: 6",
//                 "Program log: mpl core program id: RefCell { value: [] }",
//                 "Program log: [0, 0, 22, 0, 0, 0, 99, 108, 109, 109, 95, 108, 105, 113, 117, 105, 100, 105, 116, 121, 95, 97, 99, 99, 111, 117, 110, 116, 0, 0, 0, 0, 0]",
//                 "Program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d invoke [2]",
//                 "Program log: Instruction: Create",
//                 "Program 11111111111111111111111111111111 invoke [3]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: programs/mpl-core/src/state/asset.rs:155:Approve",
//                 "Program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d consumed 7171 of 107595 compute units",
//                 "Program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d success",
//                 "Program log: 7",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
//                 "Program log: Instruction: Transfer",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4728 of 90577 compute units",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
//                 "Program log: 8",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
//                 "Program log: Instruction: Transfer",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4728 of 83602 compute units",
//                 "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
//                 "Program log: 9",
//                 "Program log: 23027",
//                 "Program log: 1",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: position account data: 25",
//                 "Program log: deserialized!",
//                 "Program log: 2",
//                 "Program log: 386, 24ASDpTj4H3USFM5RYTtzkK7kfZoVzMifSPFYLTCFtLw, 24ASDpTj4H3USFM5RYTtzkK7kfZoVzMifSPFYLTCFtLw",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program 11111111111111111111111111111111 invoke [2]",
//                 "Program 11111111111111111111111111111111 success",
//                 "Program log: 3",
//                 "Program log: DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu",
//                 "Program DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu consumed 152101 of 200000 compute units",
//                 "Program DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu success",
//             ]),
//             pre_token_balances: Some([
//                 UiTransactionTokenBalance {
//                     account_index: 6,
//                     mint: "DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(9.999999335),
//                         decimals: 9,
//                         amount: "9999999335",
//                         ui_amount_string: "9.999999335",
//                     },
//                     owner: Some("GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//                 UiTransactionTokenBalance {
//                     account_index: 11,
//                     mint: "BigWsb3x6jnjaxaJaxDz3RCcB9gu39Z4agkocG6saZky",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(200.0),
//                         decimals: 3,
//                         amount: "200000",
//                         ui_amount_string: "200",
//                     },
//                     owner: Some("GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//             ]),
//             post_token_balances: Some([
//                 UiTransactionTokenBalance {
//                     account_index: 4,
//                     mint: "BigWsb3x6jnjaxaJaxDz3RCcB9gu39Z4agkocG6saZky",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(0.1),
//                         decimals: 3,
//                         amount: "100",
//                         ui_amount_string: "0.1",
//                     },
//                     owner: Some("9a8MFYeNfDZnBZusqhC7gbUee4TMCyHPFb7EVUffzGeg"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//                 UiTransactionTokenBalance {
//                     account_index: 6,
//                     mint: "DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(9.999999325),
//                         decimals: 9,
//                         amount: "9999999325",
//                         ui_amount_string: "9.999999325",
//                     },
//                     owner: Some("GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//                 UiTransactionTokenBalance {
//                     account_index: 7,
//                     mint: "DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(1e-8),
//                         decimals: 9,
//                         amount: "10",
//                         ui_amount_string: "0.00000001",
//                     },
//                     owner: Some("CgvBpwV91WzNPrdGF4Ecv3V5CjXLLw6ZfRSu1FwNRBfc"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//                 UiTransactionTokenBalance {
//                     account_index: 11,
//                     mint: "BigWsb3x6jnjaxaJaxDz3RCcB9gu39Z4agkocG6saZky",
//                     ui_token_amount: UiTokenAmount {
//                         ui_amount: Some(199.9),
//                         decimals: 3,
//                         amount: "199900",
//                         ui_amount_string: "199.9",
//                     },
//                     owner: Some("GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3"),
//                     program_id: Some("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
//                 },
//             ]),
//             rewards: Some([]),
//             loaded_addresses: Some(UiLoadedAddresses { writable: [], readonly: [] }),
//             return_data: Skip,
//             compute_units_consumed: Some(152101),
//             cost_units: Some(157443),
//         }),
//         version: Some(Legacy(Legacy)),
//     },
//     block_time: Some(1772206134),
// };
// [
//     GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3,
//     DAzqSi9rTNmaTBasyD2eFyrcPXTsimZWMNqm2VK483dC,
//     TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA,
//     HFDpr6fCBus2HQFi3wzkaLpRKYtU3rWWQ9iuzezUnFaS,
//     DB1xwND2situnNxmSCF3XNHnXXayLPoNSHDKJEfNiwpP,
//     6W6Rj2RiAArEN2pwqxtjeA4Lf4baBA9SAvMzoXhKKXmj,
//     ADE1HAFKUiNSvWyLUDoQmLsNCqUKm297m6HRfx9GPynn,
//     wvDvcczpmu61gHQCSBe9dKLKvdHiqxY76GvAPcx4mj3,
//     HNpPM9duajW87y9aWmaunt65v2ZAzxgA9kppQ1mG5W5L,
//     HvU1zj8dJmi8Bhpq15ZDFV31yARaKF3yH4sDMzfPQqa7,
//     SysvarRent111111111111111111111111111111111,
//     DjTMdzPyaS4G2Kxa6iyFbckzbtwzL6y66Wawo6WqfTRu,
//     11111111111111111111111111111111,
//     CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d,
//     99VMBkZfFd6tEXPaiaS2NJMoh4PekByidPFkuXiNZso,
//     HmNKBA3dUmxWFb9pkBGrKjLk2aqY6FsgmE98v1gYCUgC,
//     2JF11FZJtSc8zNdbsXngEhKnVxZpYMCbFLG4QxBLmJVU,
//     HARcxY7EqgYFQt8vMZVa8pNZ1GiAFHvcS5eUCYLqXtdp,
//     65QejrafEvYgacGnp4E5KxG9QeQfaD8tJfbavRadc6AA,
// ];
// [Some(Account { lamports: 5967543000, data.len: 0, owner: 11111111111111111111111111111111, executable: false, rent_epoch: 18446744073709551615 }), None, Some(Account { lamports: 8738370969, data.len: 134080, owner: BPFLoader2111111111111111111111111111111111, executable: true, rent_epoch: 18446744073709551615, data: 7f454c460201010000000000000000000300f70001000000d8f90000000000004000000000000000800902000000000000000000400038000400400009000800 }), Some(Account { lamports: 1461600, data.len: 82, owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA, executable: false, rent_epoch: 18446744073709551615, data: 01000000e3814c52d9a313e00dd8d933366f22f8a4b24f6f4274bcbd847548bf594d8586400d0300000000000301000000000000000000000000000000000000 }), Some(Account { lamports: 1461600, data.len: 82, owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA, executable: false, rent_epoch: 18446744073709551615, data: 01000000e3814c52d9a313e00dd8d933366f22f8a4b24f6f4274bcbd847548bf594d858600e40b54020000000901000000000000000000000000000000000000 }), Some(Account { lamports: 2039280, data.len: 165, owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA, executable: false, rent_epoch: 18446744073709551615, data: f15f9f9427011f97b7df7a78b13684bd4583582851e36ac264c2377ffa3b8da3e3814c52d9a313e00dd8d933366f22f8a4b24f6f4274bcbd847548bf594d8586 }), Some(Account { lamports: 2039280, data.len: 165, owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA, executable: false, rent_epoch: 18446744073709551615, data: b4dd24466694537a063df250efc11cca6aba1b02c9bb2d18de52fde785ec8e8ce3814c52d9a313e00dd8d933366f22f8a4b24f6f4274bcbd847548bf594d8586 }), None, None, None, Some(Account { lamports: 1009200, data.len: 17, owner: Sysvar1111111111111111111111111111111111111, executable: false, rent_epoch: 18446744073709551615, data: 301b000000000000000000000000f03f32 }), Some(Account { lamports: 1141440, data.len: 36, owner: BPFLoaderUpgradeab1e11111111111111111111111, executable: true, rent_epoch: 18446744073709551615, data: 0200000069c3bc1d9cce355943423bf60d5e33ca243972a163a1c3b0abaacd3e0b9f6e36 }), Some(Account { lamports: 1, data.len: 14, owner: NativeLoader1111111111111111111111111111111, executable: true, rent_epoch: 18446744073709551615, data: 73797374656d5f70726f6772616d }), Some(Account { lamports: 10001141440, data.len: 36, owner: BPFLoaderUpgradeab1e11111111111111111111111, executable: true, rent_epoch: 18446744073709551615, data: 020000007f1c8a3c8e16bf6ef90b59e3dab7ba51d87b6d91330ac64f0c724146b62364a9 }), None, None, None, None, None]

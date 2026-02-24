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
//     slot: 443429102,
//     transaction: EncodedTransactionWithStatusMeta {
//         transaction: Json(UiTransaction {
//             signatures: [
//                 "4ru5eYmKMEGYqnfSRzHdUzkcD45nfEJUTZEp8igZVbUNirftSve6mb4Cn9rkULePiftXvajTJHdADgVHPgJYW4tp",
//             ],
//             message: Raw(UiRawMessage {
//                 header: MessageHeader {
//                     num_required_signatures: 1,
//                     num_readonly_signed_accounts: 0,
//                     num_readonly_unsigned_accounts: 2,
//                 },
//                 account_keys: [
//                     "DEALD1gFL6BVEmBLkTtK6ZNt3b9PjoejNFr9d4n5EjGX",
//                     "2BKjYimEc3rocK6Nvre4nx4hsUs5acYAFHXjNGW9f5sP",
//                     "6MiaQjNgqLbdy5uSgvArLxRn5JxxJHoA4UShurw2ocpL",
//                     "8osMswuxaMsPLWJfFGqnSrqNXTSTU7Tjs4fbVpR63wXB",
//                     "8TWho983k3f3kwTqyfPPawUW7tbofDNNhh4AdkXEerwh",
//                     "9RTcSHHKb6U775MAoSVpraSJ77d42H45gj2VP9jeZyyw",
//                     "ANgfgoLzyZrJUyqxcVzeVwdBdCc1Y2eeEfbWfXWPnuYt",
//                     "bxXVYcKrSYFwmZGgDKMgen2yMvhtRQ68ya2eoTjD81b",
//                     "DEvutwZYXeFDHCFEbwjUNFBbarwgAWkckx1tfv2hw7ch",
//                     "FZPQesEpbxwv7dgVeYnKtVv3Gnk4TPUSBZKV2xV33Eon",
//                     "GPbgE1MvCdbgqZFjtF15konbWq4Mh3ckwmDiPTtMxBMn",
//                     "uaAVseJfKcV5oYbUc7f5DoXrFZ83CyDDXf242DXM9JV",
//                     "11111111111111111111111111111111",
//                     "CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2",
//                 ],
//                 recent_blockhash: "43qVh5gFCotthfZspFyV8KFJzFKmQSpifT8fXwuzRUmF",
//                 instructions: [
//                     UiCompiledInstruction {
//                         program_id_index: 13,
//                         accounts: [6, 3, 8, 2, 1, 13, 13, 13, 13, 0, 12],
//                         data: "2uQd9JuTKaHy9",
//                         stack_height: Some(1),
//                     },
//                     UiCompiledInstruction {
//                         program_id_index: 13,
//                         accounts: [11, 3, 8, 10, 1, 13, 13, 13, 13, 0, 12],
//                         data: "2QWZoY2JTRiJBMVsWd9dNJxX",
//                         stack_height: Some(1),
//                     },
//                     UiCompiledInstruction {
//                         program_id_index: 13,
//                         accounts: [4, 3, 8, 9, 1, 13, 13, 13, 13, 0, 12],
//                         data: "2QWZoY2JTRiJBSB1mmSKSRTM",
//                         stack_height: Some(1),
//                     },
//                     UiCompiledInstruction {
//                         program_id_index: 13,
//                         accounts: [7, 3, 8, 5, 1, 13, 13, 13, 13, 0, 12],
//                         data: "2uQd9JuTKaHy9",
//                         stack_height: Some(1),
//                     },
//                 ],
//                 address_table_lookups: None,
//             }),
//         }),
//         meta: Some(UiTransactionStatusMeta {
//             err: None,
//             status: Ok(()),
//             fee: 5000,
//             pre_balances: [
//                 3899795880, 1879200, 1350240, 2192400, 2387280, 1350240, 2387280, 2387280, 1037040, 1350240,
//                 1350240, 2387280, 1, 1141440,
//             ],
//             post_balances: [
//                 3899790880, 1879200, 1350240, 2192400, 2387280, 1350240, 2387280, 2387280, 1037040, 1350240,
//                 1350240, 2387280, 1, 1141440,
//             ],
//             inner_instructions: Some([]),
//             log_messages: Some([
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 invoke [1]",
//                 "Program log: Instruction: Payout",
//                 "Program data: eqL7NlT+AzAB8bsAAAAAAACLRzsfoLARrYSZBeffLZY2bwqlFGmFycLuVu4v0H1pkRGArVhUghA/1tXW/79GcBJFwtnt682P/B/rNJOR4G3KPrUAAAAAAAAA",
//                 "Program data: a1RmNNOEMo0B8bsAAAAAAABPmQ+bpUfkej/C4ATuK3lNgWNJbHwsHcu5+RCKj8Ng5YtHOx+gsBGthJkF598tljZvCqUUaYXJwu5W7i/QfWmRVvZdAAAAAAAA",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 consumed 21759 of 800000 compute units",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 success",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 invoke [1]",
//                 "Program log: Instruction: Payout",
//                 "Program data: eqL7NlT+AzAB8bsAAAAAAAANd7NQq4g72y8ot4HDEYTKtnuYywXASVuEJVpMZbM+VhGArVhUghA/1tXW/79GcBJFwtnt682P/B/rNJOR4G3KpAQDAAAAAAAA",
//                 "Program data: a1RmNNOEMo0B8bsAAAAAAADkqUpQbzWuoI+zz/JNNupzXUip8R1PuMEqJgKpK4s1VQ13s1CriDvbLyi3gcMRhMq2e5jLBcBJW4QlWkxlsz5WJC4WAQAAAAABeFAAAAAAAAA=",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 consumed 21774 of 778241 compute units",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 success",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 invoke [1]",
//                 "Program log: Instruction: Payout",
//                 "Program data: eqL7NlT+AzAB8bsAAAAAAABuzH7HVSY7DDLno5rXItCTkw72r93unAyUBSgnCc2YYBGArVhUghA/1tXW/79GcBJFwtnt682P/B/rNJOR4G3KnBABAAAAAAAA",
//                 "Program data: a1RmNNOEMo0B8bsAAAAAAADYT4oZTku680L0+8WKlLezTYLGA1s/bzNEvd5n4e7znW7MfsdVJjsMMuejmtci0JOTDvav3e6cDJQFKCcJzZhgTNt4AAAAAAABlEMAAAAAAAA=",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 consumed 21774 of 756467 compute units",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 success",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 invoke [1]",
//                 "Program log: Instruction: Payout",
//                 "Program data: eqL7NlT+AzAB8bsAAAAAAAAI9IfYjEcbqpqhB2KqomI498MlxQizgFZKYyzstBPz3hGArVhUghA/1tXW/79GcBJFwtnt682P/B/rNJOR4G3K8MMAAAAAAAAA",
//                 "Program data: a1RmNNOEMo0B8bsAAAAAAAB9IYYg/Basr2PWgCnvELzkwHw4hEh1KHp4WSMdf1aQVgj0h9iMRxuqmqEHYqqiYjj3wyXFCLOAVkpjLOy0E/Pe0MtUAAAAAAAA",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 consumed 21759 of 734693 compute units",
//                 "Program CRAS82V4t9AsALmndi9YcKVFx6eVNTefHvNFCVdp4LW2 success",
//             ]),
//             pre_token_balances: Some([]),
//             post_token_balances: Some([]),
//             rewards: Some([]),
//             loaded_addresses: Some(UiLoadedAddresses { writable: [], readonly: [] }),
//             return_data: Skip,
//             compute_units_consumed: Some(87066),
//             cost_units: Some(91607),
//         }),
//         version: Some(Legacy(Legacy)),
//     },
//     block_time: Some(1771585433),
// };

// asdfghjkl;'
// EncodedConfirmedTransactionWithStatusMeta {
//     slot: 443433284,
//     transaction: EncodedTransactionWithStatusMeta {
//         transaction: Json(UiTransaction {
//             signatures: [
//                 "3JPasEa1rXGEFgg2XAx4eenXS1monzG5TRAKggP4tMo8QS2KU5UiXvpADcnVP4CY8875Z8D2BRaV6dMgJ3wKF8TN",
//             ],
//             message: Raw(UiRawMessage {
//                 header: MessageHeader {
//                     num_required_signatures: 1,
//                     num_readonly_signed_accounts: 0,
//                     num_readonly_unsigned_accounts: 3,
//                 },
//                 account_keys: [
//                     "GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3",
//                     "KpxeS8pjg8P7o3b39cmfWd8KiZ1yc4gC2oFcYuc5beX",
//                     "HGxsrYV9gesEepzAjsCSvbkRTkVgvtyruiRxBsnq2Sbp",
//                     "HpxFLVV3jhLpnC4J2WxabBvfckXyYDb1La5uiVwF9qLT",
//                     "BPFLoaderUpgradeab1e11111111111111111111111",
//                     "SysvarC1ock11111111111111111111111111111111",
//                     "SysvarRent111111111111111111111111111111111",
//                 ],
//                 recent_blockhash: "BazXGyvMcMCtcGGhxje9odSHKFCU54DNrLVSjD4RJ2Bv",
//                 instructions: [
//                     UiCompiledInstruction {
//                         program_id_index: 4,
//                         accounts: [2, 1, 3, 0, 6, 5, 0],
//                         data: "5Sxr3",
//                         stack_height: Some(1),
//                     },
//                 ],
//                 address_table_lookups: None,
//             }),
//         }),
//         meta: Some(UiTransactionStatusMeta {
//             err: None,
//             status: Ok(()),
//             fee: 5000,
//             pre_balances: [3084600640, 1141440, 1462247280, 1462247280, 1, 1169280, 1009200],
//             post_balances: [4546842920, 1141440, 1462247280, 0, 1, 1169280, 1009200],
//             inner_instructions: Some([]),
//             log_messages: Some([
//                 "Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]",
//                 "Upgraded program KpxeS8pjg8P7o3b39cmfWd8KiZ1yc4gC2oFcYuc5beX",
//                 "Program BPFLoaderUpgradeab1e11111111111111111111111 success",
//             ]),
//             pre_token_balances: Some([]),
//             post_token_balances: Some([]),
//             rewards: Some([]),
//             loaded_addresses: Some(UiLoadedAddresses { writable: [], readonly: [] }),
//             return_data: Skip,
//             compute_units_consumed: Some(2370),
//             cost_units: Some(4395),
//         }),
//         version: Some(Legacy(Legacy)),
//     },
//     block_time: Some(1771587054),
// };
// EncodedConfirmedTransactionWithStatusMeta {
//     slot: 443927203,
//     transaction: EncodedTransactionWithStatusMeta {
//         transaction: Json(UiTransaction {
//             signatures: [
//                 "56FLvM6NWrUFJCbjuhUtQpg3W6YMzj3aur263E9Ucta2XdWTGb828EKWKyZmKseNck5GUwv4F1VxAqifxLgmGSSg",
//             ],
//             message: Raw(UiRawMessage {
//                 header: MessageHeader {
//                     num_required_signatures: 1,
//                     num_readonly_signed_accounts: 0,
//                     num_readonly_unsigned_accounts: 3,
//                 },
//                 account_keys: [
//                     "GK5uAKRv4Abn4szsDuhvcBDoYp8cwAcggkkynMjmSZf3",
//                     "KpxeS8pjg8P7o3b39cmfWd8KiZ1yc4gC2oFcYuc5beX",
//                     "4uHCMjbVxuqwcXDdkakatLSx7hsSFtdXH5MB2XHaZjK2",
//                     "HGxsrYV9gesEepzAjsCSvbkRTkVgvtyruiRxBsnq2Sbp",
//                     "BPFLoaderUpgradeab1e11111111111111111111111",
//                     "SysvarC1ock11111111111111111111111111111111",
//                     "SysvarRent111111111111111111111111111111111",
//                 ],
//                 recent_blockhash: "BPWqMPMNxTWnEMt2oRtSTJ7caMNPQE1smAD44k7uRche",
//                 instructions: [
//                     UiCompiledInstruction {
//                         program_id_index: 4,
//                         accounts: [3, 1, 2, 0, 6, 5, 0],
//                         data: "5Sxr3",
//                         stack_height: Some(1),
//                     },
//                 ],
//                 address_table_lookups: None,
//             }),
//         }),
//         meta: Some(UiTransactionStatusMeta {
//             err: None,
//             status: Ok(()),
//             fee: 5000,
//             pre_balances: [3080380640, 1141440, 1462247280, 1462247280, 1, 1169280, 1009200],
//             post_balances: [4542622920, 1141440, 0, 1462247280, 1, 1169280, 1009200],
//             inner_instructions: Some([]),
//             log_messages: Some([
//                 "Program BPFLoaderUpgradeab1e11111111111111111111111 invoke [1]",
//                 "Upgraded program KpxeS8pjg8P7o3b39cmfWd8KiZ1yc4gC2oFcYuc5beX",
//                 "Program BPFLoaderUpgradeab1e11111111111111111111111 success",
//             ]),
//             pre_token_balances: Some([]),
//             post_token_balances: Some([]),
//             rewards: Some([]),
//             loaded_addresses: Some(UiLoadedAddresses { writable: [], readonly: [] }),
//             return_data: Skip,
//             compute_units_consumed: Some(2370),
//             cost_units: Some(4395),
//         }),
//         version: Some(Legacy(Legacy)),
//     },
//     block_time: Some(1771775468),
// };

use axum::{http::StatusCode, response::{IntoResponse, Response}};

#[derive(thiserror::Error, Debug)]
pub enum Error{

    #[error("authentication required")]
    Unauthorized,

    #[error("request to remote server failed!")]
    RequestFailed,
    
    #[error("Failed to parse the response into given Struct type")]
    ParsingFailed,

    #[error("Connection to the database failed")]
    DBError(#[from] sqlx::Error)
}
impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let response = match self{
            Error::DBError(e) =>{
                (StatusCode::INTERNAL_SERVER_ERROR, format!("HTTP Error: {:?}", e)).into_response()
            }
            _ =>{
                (StatusCode::INTERNAL_SERVER_ERROR, format!("HTTP Error: {}", self)).into_response()
            }
        };
        response
        // You can customize the status code and body based on the error type
    }
}

impl From<reqwest::Error> for Error{
    fn from(err: reqwest::Error) -> Self {
        println!("reqwest failed: {:#?}", err);
        Error::RequestFailed
    }   
}

impl From<serde_json::Error> for Error{
    fn from(err: serde_json::Error) -> Self{
        println!("Error while trying to parse into json: {:?}", err);
        Error::ParsingFailed
    }
}

// impl From<sqlx::Error> for Error{
//     fn from(err: sqlx::Error) -> Self{
//         println!("Error while connecting to the database: {:?}", err);
//         Error::DBError
//     }
// }
use num_enum;
use spl_program_error::spl_program_error;

#[spl_program_error(hash_error_code_start = 3058088441)]
pub enum AMMError {
    #[error("this account is not owned by current account")]
    IllegalOwner,

    #[error("admin account must be signer!")]
    InvalidSigner,
    
    #[error("Token account is frozen.")]
    TokenAccountFrozen,
    
    #[error("Token account is UnInitialized.")]
    TokenAccountNotInitialized,

    #[error("Insufficient token balance in admin account.")]
    InsufficientTokenBalance,

    #[error("account must be writable!")]
    NotWritable,

    #[error("account already initialized")]
    AccountAlreadyInitialized,

    #[error("account is not initialized")]
    AccountNotInitialized,

    #[error("invalid mint account provided")]
    InvalidMintAccount,
    
    #[error("invalid system program account provided")]
    InvalidSystemProgram,

    #[error("invalid spl token program account provided")]
    InvalidSPLTokenProgram,

    #[error("invalid MPL core program account provided")]
    InvalidMPL_CoreProgram,
    #[error("invalid lp token mint account provided")]
    InvalidLPTokenMintAccount,

    #[error("invalid amm token account provided.")]
    InvalidAMMTokenAccount,

    #[error("invalid PDA account provided.")]
    InvalidPDA,

    #[error("Insufficient Lp Tokens Available")]
    InsufficientLpTokensAvailable,
    
    #[error("Price exceeds the privided Max price")]
    PriceTooHigh,

    #[error("Invalid Position Account Provided!")]
    InvalidPositionAccount,

    #[error("Initial price is not in between the provided tick range.")]
    InitialPriceOutOfRange,

    #[error("Invalid Bitmap Array Provided.")]
    InvalidBitmapArray,

    #[error("Invalid Tick array provided!")]
    InvalidTickArray
}


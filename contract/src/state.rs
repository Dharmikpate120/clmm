use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    msg,
    program_error::ProgramError,
    program_pack::{ IsInitialized, Pack, Sealed },
    pubkey::Pubkey,
};

pub const TICK_ARRAY_SIZE: u32 = 88;

#[derive(BorshDeserialize, BorshSerialize)]
pub enum AMMAccount {
    Uninitialized,
    Initialized {
        pool_authority: Pubkey, //32
        token_a_mint: Pubkey, //32 - 64
        token_b_mint: Pubkey, //32 - 96
        // lp_token_mint: Pubkey,//32 - 128
        token_a_pool: Pubkey, //32 - 160
        token_b_pool: Pubkey, //32 - 192
        sqrt_price_a_by_b: u128, //16 - 208
        current_tick: u32, //4 - 212
        active_liquidity: u128, //16 - 228
        fee_growth: u128, //16 - 244
        protocol_fee: u64, //8 - 252
    },
}

// The `Sealed` trait is a marker trait to prevent
// other crates from implementing `Pack` for our state.
impl Sealed for AMMAccount {}

impl IsInitialized for AMMAccount {
    /// Checks if the account has been initialized.
    fn is_initialized(&self) -> bool {
        match self {
            AMMAccount::Initialized { .. } => true,
            _ => false,
        }
    }
}

impl Pack for AMMAccount {
    /// The length of the account's data in bytes.
    const LEN: usize = 1 + 220;

    /// Deserializes a byte slice into a [StakeAccount].
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let acc = Self::try_from_slice(src).map_err(|_| {
            msg!("Error: Failed to deserialize counter account data");
            ProgramError::InvalidAccountData
        })?;
        Ok(acc)
    }

    /// Serializes a [StakeAccount] into a byte slice.
    fn pack_into_slice(&self, dst: &mut [u8]) {
        self.serialize(&mut &mut dst[..]).expect("Failed to serialize counter account");
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub enum PositionAccount {
    Uninitialized,
    Initialized {
        start_tick: u32, //32
        end_tick: u32,
        liquidity: u128,
    },
}

// The `Sealed` trait is a marker trait to prevent
// other crates from implementing `Pack` for our state.
impl Sealed for PositionAccount {}

impl IsInitialized for PositionAccount {
    /// Checks if the account has been initialized.
    fn is_initialized(&self) -> bool {
        match self {
            PositionAccount::Initialized { .. } => true,
            _ => false,
        }
    }
}

impl Pack for PositionAccount {
    /// The length of the account's data in bytes.
    const LEN: usize = 1 + 32;

    /// Deserializes a byte slice into a [StakeAccount].
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let acc = Self::try_from_slice(src).map_err(|_| {
            msg!("Error: Failed to deserialize counter account data");
            ProgramError::InvalidAccountData
        })?;
        Ok(acc)
    }

    /// Serializes a [StakeAccount] into a byte slice.
    fn pack_into_slice(&self, dst: &mut [u8]) {
        self.serialize(&mut &mut dst[..]).expect("Failed to serialize counter account");
    }
}

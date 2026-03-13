use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    msg,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
};

use crate::state::TICK_ARRAY_SIZE;


// #[derive(BorshDeserialize, BorshSerialize, Copy, Clone)]
// pub struct TickState {
//        pub net_liquidity: i64,
//         // pub tick_index: u32,
// }
// impl Default for TickState{
//     fn default() -> Self {
//         TickState{
//             net_liquidity: 0,
//             tick_index: 0
//         }
//     }
// }
#[derive(BorshDeserialize, BorshSerialize)]
pub struct TickArray {
    pub ticks: [i64; TICK_ARRAY_SIZE as usize]
}

// The `Sealed` trait is a marker trait to prevent
// other crates from implementing `Pack` for our state.
impl Sealed for TickArray {}

// impl IsInitialized for TickArray {
//     /// Checks if the account has been initialized.
//     fn is_initialized(&self) -> bool {
//         match self{
//             TickArray::Initialized{  .. } => true,
//             _ => false,
//         }
//     }
// }

impl Pack for TickArray {
    /// The length of the account's data in bytes.
    const LEN: usize = 8 * TICK_ARRAY_SIZE as usize;
    //  + 8;

    /// Deserializes a byte slice into a [StakeAccount].
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let acc = Self::try_from_slice(src).map_err(|_| {
            msg!("Error: Failed to deserialize counter account data");
            ProgramError::InvalidAccountData
        })?;
        // if !acc.is_initialized{
        //     msg!("Error: Account is not initialized!");
        //     return Err(AMMError::AccountNotInitialized.into());
        // }
        Ok(acc)
    }

    /// Serializes a [StakeAccount] into a byte slice.
    fn pack_into_slice(&self, dst: &mut [u8]) {
        self.serialize(&mut &mut dst[..])
           .expect("Failed to serialize counter account");
    }
}

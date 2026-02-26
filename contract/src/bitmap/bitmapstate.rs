use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{ msg, program_pack::{ IsInitialized, Pack, Sealed } };
use solana_program_error::ProgramError;

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct Bitmap {
        pub bitmap: [u8; 10000]
}
// impl IsInitialized for Bitmap {
//     /// Checks if the account has been initialized.
//     fn is_initialized(&self) -> bool {
//         match self {
//             Bitmap::Initialized { .. } => true,
//             _ => false,
//         }
//     }
// }
impl Sealed for Bitmap {}

impl Pack for Bitmap {
    const LEN: usize = 10000;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        self.serialize(&mut &mut dst[..]).expect("Failed to serialize counter account");
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Bitmap, ProgramError> {
        let acc = Self::try_from_slice(src).map_err(|_| {
            msg!("Error: Failed to deserialize counter account data");
            ProgramError::InvalidAccountData
        })?;
        Ok(acc)
    }
}

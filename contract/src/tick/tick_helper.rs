use crate::state::TICK_ARRAY_SIZE;

pub fn update_tick_with_index(ticks: &mut [u8], tick_index: u32, liquidity: u64, add: bool) {
    let tick = tick_index % TICK_ARRAY_SIZE;
    let ticks_i64: &mut [i64] = bytemuck::cast_slice_mut(ticks);
    // let mut tick_value = i64::from_le_bytes(
    //     ticks[(tick * 8) as usize..(tick * 8 + 8) as usize]
    //         .try_into()
    //         .expect("slice was not of size!")
    // );

    if add {
        ticks_i64[tick as usize] += liquidity as i64;
    } else {
        ticks_i64[tick as usize] -= liquidity as i64;
    }

    // let tick_bytes: [u8; 8] = tick_value.to_le_bytes();

    // for (index, i) in tick_bytes.iter().enumerate() {
    //     ticks[tick as usize + index] = *i;
    // };
}

//more optimized
// use bytemuck::{cast_slice_mut};

// pub fn update_tick_with_index(ticks: &mut [u8], tick_index: u32, liquidity: u64, add: bool) {
//     let tick = (tick_index % TICK_ARRAY_SIZE) as usize;
    
//     // 1. Cast the entire u8 slice to a mutable i64 slice (Zero Cost)
//     // This assumes your u8 slice is 8-byte aligned (standard for Solana account data)
//     let i64_ticks = cast_slice_mut::<u8, i64>(ticks);

//     // 2. Perform the update directly on the memory
//     if add {
//         i64_ticks[tick] = i64_ticks[tick].wrapping_add(liquidity as i64);
//     } else {
//         i64_ticks[tick] = i64_ticks[tick].wrapping_sub(liquidity as i64);
//     }
// }
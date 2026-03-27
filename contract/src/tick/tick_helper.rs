use crate::state::TICK_ARRAY_SIZE;

pub fn update_tick_with_index(ticks: &mut [u8], tick_index: u32, liquidity: u64, add: bool) {
    let tick = tick_index % TICK_ARRAY_SIZE;
    let ticks_i64: &mut [i64] = bytemuck::cast_slice_mut(ticks);

    if add {
        ticks_i64[tick as usize] += liquidity as i64;
    } else {
        ticks_i64[tick as usize] -= liquidity as i64;
    }
}

pub fn price_to_tick_index(price: f64) -> u32 {
    return (price.ln() / (1.0001_f64).ln()).floor() as u32;
}
pub fn tick_index_to_price(tick_index: u32) -> f64 {
    return (1.0001_f64).powi(tick_index as i32);
}
pub fn value_to_sqrt_q6464(price: f64) -> u128 {
    let sqrt_price = price.sqrt();
    (sqrt_price * (2.0 as f64).powi(64)).floor() as u128
}

pub fn q6464_sqrt_to_value(stored_price: u128) -> f64 {
    let sqrt_price = (stored_price as f64) / (2.0 as f64).powi(64);
    sqrt_price * sqrt_price
}

pub fn calculate_delta_a(lower_price: f64, higher_price: f64, liquidity: f64) -> f64 {
    let sqrt_lower = lower_price.sqrt();
    let sqrt_higher = higher_price.sqrt();

    liquidity * ((sqrt_higher - sqrt_lower) as f64)
}

pub fn calculate_delta_b(lower_price: f64, higher_price: f64, liquidity: f64) -> f64 {
    let sqrt_lower = lower_price.sqrt();
    let sqrt_higher = higher_price.sqrt();

    liquidity * ((1 as f64 / sqrt_higher - 1 as f64 / sqrt_lower) as f64)
}

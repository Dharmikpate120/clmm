pub fn price_to_tick_index(price: f64) -> i32 {
    return (price.ln() / 1.0001_f64.ln()).floor() as i32; 
}

pub fn value_to_sqrt_q6464(price:f64) -> u128 {
    let sqrt_price = (price).sqrt();
    (sqrt_price * (2.0 as f64).powi(64)).floor() as u128
}

pub fn q6464_sqrt_to_value(stored_price: u128) -> f64 {
    let sqrt_price = (stored_price as f64) / (2.0 as f64).powi(64);
    sqrt_price * sqrt_price
}
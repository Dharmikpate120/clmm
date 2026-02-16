pub fn delta_b_from_delta_p(price_low: f64, price_high: f64, liquidity: u64) -> f64{
    liquidity as f64 * ((1 as f64/price_low.sqrt()) - (1 as f64/price_high.sqrt()))
}

pub fn delta_a_from_delta_p(price_low: f64, price_high: f64, liquidity: u64)-> f64{
    liquidity as f64 * (price_high.sqrt() - price_low.sqrt())
}

pub fn price_with_a_and_liquidity(a:f64, liquidity: f64) -> f64{
    a.powi(2) * liquidity.powi(2)
}
pub fn price_with_b_and_liquidity(b:f64, liquidity: f64) -> f64{
    liquidity.powi(2) / b.powi(2)
}
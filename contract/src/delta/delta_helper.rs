use num_traits::Float;
use solana_program::msg;
// use solana_program::msg!;

pub fn delta_b_from_delta_p(price_low: f64, price_high: f64, liquidity: u64) -> f64 {
    liquidity as f64 * ((1 as f64 / price_low.sqrt()) - (1 as f64 / price_high.sqrt()))
}

pub fn delta_a_from_delta_p(price_low: f64, price_high: f64, liquidity: u64) -> f64 {
    liquidity as f64 * (price_high.sqrt() - price_low.sqrt())
}

pub fn price_with_a_and_liquidity(a: f64, liquidity: f64) -> f64 {
    a.powi(2) / liquidity.powi(2)
}
pub fn price_with_b_and_liquidity(b: f64, liquidity: f64) -> f64 {
    liquidity.powi(2) / b.powi(2)
}

pub fn token_price_with_constant_liquidity_by_b(liquidity: u64, token_amount: f64) -> f64 {
    liquidity as f64 / token_amount
}

pub fn token_price_with_constant_liquidity_by_a(liquidity: u64, token_amount: f64) -> f64 {
    token_amount / liquidity as f64
}

pub fn upper_price_from_delta_a(delta_a: f64, liquidity: u64, lower_price: f64) -> f64 {
    let res1 = delta_a / liquidity as f64;
    let res2 = lower_price.sqrt();
    msg!("res1: {}, res2: {}", res1, res2);
    (delta_a / liquidity as f64 + lower_price.sqrt()).powi(2)
}

pub fn lower_price_from_delta_b(delta_b: f64, liquidity: u64, higher_price: f64) -> f64 {
    let res1 = liquidity as f64 * higher_price.sqrt();
    let res2 = delta_b * higher_price.sqrt() + liquidity as f64;
    msg!(
        "res1: {}, res2: {}, higher_price: {}",
        res1,
        res2,
        higher_price
    );
    (res1 / res2).powi(2)
}

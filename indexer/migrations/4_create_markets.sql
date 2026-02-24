CREATE TABLE "markets"
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),

    mint_address_a VARCHAR(44) NOT NULL,

    mint_address_b VARCHAR(44) NOT NULL,

    current_price TEXT NOT NULL,

    current_tick TEXT NOT NULL,

    fees TEXT NOT NULL,
    
    active_liquidity TEXT NOT NULL,

    pool_address_a VARCHAR(44) NOT NULL,

    pool_address_b VARCHAR(44) NOT NULL
);
CREATE INDEX IX_mint_address_a ON "markets" (mint_address_a);
CREATE INDEX IX_mint_address_b ON "markets" (mint_address_b);
CREATE INDEX IX_pool_address_a ON "markets" (pool_address_a);
CREATE INDEX IX_pool_address_b ON "markets" (pool_address_b);
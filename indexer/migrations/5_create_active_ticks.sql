CREATE TABLE "active_ticks"
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),

    market_id uuid NOT NULL REFERENCES markets(id),
    
    tick_position INTEGER NOT NULL,
    
    net_liquidity TEXT NOT NULL
);
    CREATE INDEX IX_market_id ON "active_ticks" (market_id);
    CREATE INDEX IX_tick_position ON "active_ticks" (tick_position);
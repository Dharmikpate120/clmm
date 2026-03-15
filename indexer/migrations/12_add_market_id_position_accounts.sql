ALTER TABLE position_accounts
ADD market_id uuid ;

CREATE INDEX IX_market_id_position_accounts ON "position_accounts" (market_id);
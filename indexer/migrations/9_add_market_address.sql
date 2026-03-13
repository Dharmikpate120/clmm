ALTER TABLE markets 
ADD market_address VARCHAR(44) NOT NULL;
CREATE INDEX IX_markets_market_address ON "markets" (market_address);
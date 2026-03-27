ALTER TABLE transactions
ADD market_address uuid NOT NULL REFERENCES markets(id),
ADD price TEXT NOT NULL,
ADD created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IX_transaction_market_address ON "transactions" (market_address);
CREATE INDEX IX_transaction_created_at ON "transactions" (created_at);

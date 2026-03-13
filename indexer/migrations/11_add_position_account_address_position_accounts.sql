ALTER TABLE position_accounts
ADD position_address VARCHAR(44) UNIQUE;
CREATE INDEX IX_position_address_position_accounts ON "position_accounts" (position_address);
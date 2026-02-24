CREATE TABLE "position_accounts"
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    
    user_address VARCHAR(44) NOT NULL REFERENCES users(id),
    
    nft_address VARCHAR(44) NOT NULL,
    
    start_tick TEXT NOT NULL,
    
    end_tick TEXT NOT NULL,
    
    liquidity TEXT NOT NULL
);
    CREATE INDEX IX_user_address ON "position_accounts" (user_address);
    CREATE INDEX IX_nft_address ON "position_accounts"(nft_address);
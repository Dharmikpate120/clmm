CREATE TABLE "user_token_accounts"
(
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),

    user_address varchar(44) NOT NULL REFERENCES users(id),

    token_mint_address VARCHAR(44) NOT NULL,
    
    token_address VARCHAR(44) NOT NULL,
    
    balance TEXT NOT NULL
);
    CREATE INDEX IX_token_mint_address ON "user_token_accounts" (token_mint_address);
    CREATE INDEX IX_user_address_token ON "user_token_accounts" (user_address);
    CREATE INDEX IX_token_address ON "user_token_accounts" (token_address);
create table "token_pool" (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v1mc(),
    market_id uuid NOT NULL REFERENCES markets,
    token_mint_address VARCHAR(44) NOT NULL,
    token_address VARCHAR(44) NOT NULL,
    token_amount TEXT NOT NULL
);
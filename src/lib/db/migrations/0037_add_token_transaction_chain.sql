-- Add chain_hash, prev_hash, nonce columns to token_transactions
ALTER TABLE token_transactions 
ADD COLUMN chain_hash varchar(64),
ADD COLUMN prev_hash varchar(64),
ADD COLUMN nonce varchar(32);

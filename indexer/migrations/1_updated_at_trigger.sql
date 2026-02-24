-- Function to automatically set the 'updated_at' column to the current time (NOW())
-- whenever a row in the table is updated.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the updated_at field to the current transaction time.
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add shop username for personalized URLs
ALTER TABLE shops 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL DEFAULT '';

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_shops_username ON shops(username);

-- Update existing shops to have a temporary username (you'll need to update these manually)
-- UPDATE shops SET username = CONCAT('shop_', id) WHERE username = '';
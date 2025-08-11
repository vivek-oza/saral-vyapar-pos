-- Ensure users table has columns required for OTP-based password reset

-- Add reset_otp code column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_otp TEXT;

-- Add expiration column as timestamptz (timezone-aware)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMPTZ;

-- Add attempts column with default 0 and not null
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_otp_attempts INTEGER DEFAULT 0;

-- Normalize type/defaults if they already exist
ALTER TABLE users
ALTER COLUMN reset_otp_attempts SET DEFAULT 0;

-- Optional: ensure reset_token_expires is also timestamptz (if used as fallback)
-- ALTER TABLE users
-- ALTER COLUMN reset_token_expires TYPE TIMESTAMPTZ
-- USING (CASE WHEN reset_token_expires IS NULL THEN NULL ELSE (reset_token_expires AT TIME ZONE 'UTC') END);



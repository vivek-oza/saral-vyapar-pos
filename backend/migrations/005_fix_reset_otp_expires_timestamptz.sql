-- Use timezone-aware type and normalize to UTC for reset_otp_expires
ALTER TABLE users
ALTER COLUMN reset_otp_expires TYPE TIMESTAMPTZ
USING (CASE
         WHEN reset_otp_expires IS NULL THEN NULL
         ELSE (reset_otp_expires AT TIME ZONE 'UTC')
       END);

-- Optional (if not already timestamptz)
-- ALTER TABLE users
-- ALTER COLUMN reset_token_expires TYPE TIMESTAMPTZ
-- USING (reset_token_expires::timestamptz);

-- Ensure attempts default remains intact
ALTER TABLE users
ALTER COLUMN reset_otp_attempts SET DEFAULT 0;
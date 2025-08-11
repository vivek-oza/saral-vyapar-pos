-- Add OTP support to users table
ALTER TABLE users 
DROP COLUMN verification_token,
ADD COLUMN otp_code VARCHAR(6),
ADD COLUMN otp_expires_at TIMESTAMPTZ,
ADD COLUMN otp_attempts INTEGER DEFAULT 0;
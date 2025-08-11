-- Add password reset OTP fields to users table
ALTER TABLE users 
ADD COLUMN reset_otp VARCHAR(6),
ADD COLUMN reset_otp_expires TIMESTAMP,
ADD COLUMN reset_otp_attempts INTEGER DEFAULT 0;

-- Add index for performance
CREATE INDEX idx_users_reset_otp ON users(reset_otp) WHERE reset_otp IS NOT NULL;
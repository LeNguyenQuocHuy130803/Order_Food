-- Migration Script: Add Account Lockout Fields
-- This script adds brute force protection fields to the users table

-- Add columns for account lockout mechanism
ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN is_account_locked BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE users ADD COLUMN lockout_time DATETIME NULL;

-- Add index on email for faster queries during login
ALTER TABLE users ADD INDEX idx_email (email);

-- Optional: Add index on is_account_locked for filtering locked accounts
ALTER TABLE users ADD INDEX idx_account_locked (is_account_locked);

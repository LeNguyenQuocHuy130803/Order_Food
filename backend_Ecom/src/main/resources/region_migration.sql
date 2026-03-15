-- Migration Script: Add Region Column to Drinks Table
-- This script adds a region field to track which region each drink is sold in

ALTER TABLE drinks ADD COLUMN region VARCHAR(50) DEFAULT 'HA_NOI' NOT NULL;

-- Add index on region for faster filtering
ALTER TABLE drinks ADD INDEX idx_region (region);



# ////////////////////////////////////////////////////////////////////////////////////////

UPDATE drinks SET region = 'HA_NOI' WHERE region = 'HANOI';

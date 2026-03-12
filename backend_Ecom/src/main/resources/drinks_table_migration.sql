-- Migration Script: Create Drinks Table
-- This script creates the drinks table for the e-commerce drink functionality

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT,
    price BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    type VARCHAR(255) NOT NULL DEFAULT 'NORMAL',
    unit VARCHAR(255) NOT NULL DEFAULT 'ITEM',
    category VARCHAR(255) NOT NULL DEFAULT 'DRINK',
    image_url VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
);
 
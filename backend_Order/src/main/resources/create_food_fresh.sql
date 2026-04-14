-- ================================================================
-- Migration: Create Food and Fresh Product Tables
-- Date: 2026-03-15
-- Description: Create tables for Food and Fresh products
-- ================================================================

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT,
    price BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    unit VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_region (region),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create fresh_products table
CREATE TABLE IF NOT EXISTS freshs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT,
    price BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    unit VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_featured (featured),
    INDEX idx_region (region),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ================================================================
-- Migration: Create Desserts Table
-- Date: 2026-03-16
-- Description: Create table for Dessert products
-- ================================================================

-- Create desserts table
CREATE TABLE IF NOT EXISTS desserts (
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

-- Insert sample dessert data
INSERT INTO desserts (name, description, price, quantity, image_url, category, featured, unit, region, created_at) VALUES
-- Cakes
('Chocolate Layer Cake', 'Rich chocolate cake with creamy frosting and chocolate shavings', 180000, 15, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/chocolate-cake.jpg', 'CAKE', true, 'PORTION', 'HA_NOI', '2024-03-10 08:00:00'),
('Strawberry Cheesecake', 'Creamy cheesecake topped with fresh strawberries and berry coulis', 250000, 12, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/strawberry-cheesecake.jpg', 'CHEESECAKE', true, 'PORTION', 'HA_NOI', '2024-03-10 08:00:00'),
('Vanilla Sponge Cake', 'Light and fluffy vanilla sponge with whipped cream', 120000, 20, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/vanilla-cake.jpg', 'CAKE', false, 'PORTION', 'HA_NOI', '2024-03-10 08:00:00'),
('Carrot Cake', 'Moist carrot cake with cream cheese frosting and pecans', 200000, 10, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/carrot-cake.jpg', 'CAKE', false, 'PORTION', 'HO_CHI_MINH', '2024-03-10 08:00:00'),

-- Cookies
('Chocolate Chip Cookies', 'Classic homemade cookies loaded with chocolate chips', 80000, 30, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/choco-cookies.jpg', 'COOKIE', true, 'PACK', 'HA_NOI', '2024-03-10 08:00:00'),
('Macadamia Nut Cookies', 'Buttery cookies with roasted macadamia nuts', 120000, 20, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/macadamia-cookies.jpg', 'COOKIE', false, 'PACK', 'HA_NOI', '2024-03-10 08:00:00'),
('Oatmeal Raisin Cookies', 'Wholesome oatmeal cookies with plump raisins', 70000, 25, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/oatmeal-cookies.jpg', 'COOKIE', false, 'PACK', 'DA_NANG', '2024-03-10 08:00:00'),

-- Puddings
('Chocolate Pudding', 'Smooth and creamy chocolate pudding with cocoa powder', 60000, 35, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/choco-pudding.jpg', 'PUDDING', false, 'BOWL', 'HA_NOI', '2024-03-10 08:00:00'),
('Vanilla Pudding', 'Classic vanilla pudding served with whipped cream', 55000, 40, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/vanilla-pudding.jpg', 'PUDDING', false, 'BOWL', 'HA_NOI', '2024-03-10 08:00:00'),
('Mango Pudding', 'Silky mango pudding with fresh mango bits', 75000, 20, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/mango-pudding.jpg', 'PUDDING', true, 'BOWL', 'HO_CHI_MINH', '2024-03-10 08:00:00'),

-- Brownies
('Fudgy Brownies', 'Dense chocolate brownies with gooey center', 90000, 25, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/fudgy-brownies.jpg', 'BROWNIE', true, 'PIECE', 'HA_NOI', '2024-03-10 08:00:00'),
('Walnut Brownies', 'Rich brownies studded with toasted walnuts', 110000, 18, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/walnut-brownies.jpg', 'BROWNIE', false, 'PIECE', 'DA_NANG', '2024-03-10 08:00:00'),

-- Tiramisu
('Classic Tiramisu', 'Traditional Italian tiramisu with mascarpone and cocoa', 140000, 15, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/tiramisu.jpg', 'TIRAMISU', true, 'PORTION', 'HA_NOI', '2024-03-10 08:00:00'),

-- Donuts
('Glazed Donuts', 'Classic glazed donuts - half dozen', 95000, 30, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/glazed-donuts.jpg', 'DONUT', false, 'PACK', 'HA_NOI', '2024-03-10 08:00:00'),
('Chocolate Donuts', 'Chocolate donuts with colorful sprinkles - half dozen', 110000, 25, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/chocolate-donuts.jpg', 'DONUT', true, 'PACK', 'HO_CHI_MINH', '2024-03-10 08:00:00'),
('Boston Cream Donuts', 'Donuts filled with vanilla cream and chocolate topping - half dozen', 130000, 20, 'https://res.cloudinary.com/demo/image/fetch/c_fill,w_400/https://d2j6dbhohohx5w.cloudfront.net/img/desserts/boston-cream-donuts.jpg', 'DONUT', false, 'PACK', 'DA_NANG', '2024-03-10 08:00:00');
